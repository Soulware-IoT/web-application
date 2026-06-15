import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { EmailOtpType, Session } from '@supabase/supabase-js';
import { environment } from '../../../../environments/environment';
import { SupabaseService } from '../../../core/services/supabase.service';

/**
 * Punto central de auth/oauth para TODOS los medios.
 *
 * La decision web-vs-app se toma por el TIPO DE FLUJO + el OS del navegador,
 * NO por un query param, porque el medio donde se abre el callback puede
 * diferir del medio donde se inicio (ej. registro en celular, email abierto
 * en la PC).
 *
 *  - OAuth (`?code=` PKCE): siempre ocurre en este mismo navegador (el boton
 *    "Continue with Google" de la web). Se resuelve y va a /app. No rebota.
 *  - Confirmacion de email (`token_hash`/`type` -> verifyOtp, o tokens en el
 *    fragmento): NO necesita code_verifier, asi que la web resuelve la sesion
 *    en CUALQUIER dispositivo. Luego:
 *      - Desktop / iOS: queda logueado en la web (/app).
 *      - Android: intenta abrir la app via deep link pasando los tokens ya
 *        resueltos; si la app no abre (no instalada), ofrece descargarla.
 *
 * Requiere que la plantilla de email de Supabase use `{{ .TokenHash }}` para
 * que la confirmacion funcione cross-device (el `?code=` por defecto exige el
 * verifier del dispositivo que inicio el flujo). Ver memoria del proyecto.
 */
@Component({
  selector: 'app-auth-callback',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './auth-callback.html',
})
export class AuthCallback implements OnInit {
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);

  protected readonly error = signal<string | null>(null);
  protected readonly status = signal('Processing callback…');
  protected readonly showDownload = signal(false);
  protected readonly downloadUrl = environment.appDownloadUrl;

  async ngOnInit(): Promise<void> {
    const query = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));

    const errorDescription = query.get('error_description') ?? hash.get('error_description');
    if (errorDescription) {
      this.error.set(errorDescription);
      return;
    }

    const result = await this.resolveSession(query, hash);
    if (result.error) {
      this.error.set(result.error);
      return;
    }
    if (!result.session) {
      this.error.set('No authentication parameters found in the callback URL.');
      return;
    }

    // Solo los flujos de email pueden haberse originado en otro dispositivo.
    // OAuth ocurre en este navegador, asi que nunca rebota a la app.
    if (result.isEmailFlow && this.isAndroid()) {
      this.openAppWithFallback(result.session);
    } else {
      this.router.navigateByUrl('/app');
    }
  }

  /** Resuelve la sesion segun el tipo de parametros presentes en la URL. */
  private async resolveSession(
    query: URLSearchParams,
    hash: URLSearchParams,
  ): Promise<{ session: Session | null; error: string | null; isEmailFlow: boolean }> {
    const code = query.get('code');
    if (code) {
      const { data, error } = await this.supabase.supabase.auth.exchangeCodeForSession(code);
      return { session: data.session, error: error?.message ?? null, isEmailFlow: false };
    }

    const tokenHash = query.get('token_hash');
    const type = query.get('type') as EmailOtpType | null;
    if (tokenHash && type) {
      const { data, error } = await this.supabase.supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      });
      return { session: data.session, error: error?.message ?? null, isEmailFlow: true };
    }

    const accessToken = hash.get('access_token');
    const refreshToken = hash.get('refresh_token');
    if (accessToken && refreshToken) {
      const { data, error } = await this.supabase.supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      return { session: data.session, error: error?.message ?? null, isEmailFlow: true };
    }

    return { session: null, error: null, isEmailFlow: false };
  }

  private isAndroid(): boolean {
    return /android/i.test(navigator.userAgent);
  }

  /**
   * Intenta abrir la app via deep link pasando los tokens ya resueltos.
   * Si tras un breve timeout la pagina sigue visible (la app no abrio),
   * muestra el fallback de descarga.
   */
  private openAppWithFallback(session: Session): void {
    this.status.set('Opening the app…');
    const params = new URLSearchParams({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
    const deepLink = `${environment.mobileDeepLink}#${params.toString()}`;

    let switchedToApp = false;
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        switchedToApp = true;
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    window.location.href = deepLink;

    window.setTimeout(() => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (!switchedToApp) {
        this.showDownload.set(true);
      }
    }, 1500);
  }

  protected continueInBrowser(): void {
    // La sesion ya quedo activa en este navegador al resolverla arriba.
    this.router.navigateByUrl('/app');
  }
}
