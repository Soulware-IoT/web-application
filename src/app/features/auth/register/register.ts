import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { SupabaseService } from '../../../core/services/supabase.service';
import { GoogleButton } from '../../../shared/components/google-button/google-button';
import { PasswordField } from '../../../shared/components/password-field/password-field';

/** Validador de grupo: la contraseña y su confirmación deben coincidir. */
function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, TranslocoPipe, GoogleButton, PasswordField],
  templateUrl: './register.html',
})
export class Register {
  private readonly supabase = inject(SupabaseService);
  private readonly fb = inject(FormBuilder);
  private readonly transloco = inject(TranslocoService);

  protected readonly error = signal<string | null>(null);
  protected readonly message = signal<string | null>(null);
  protected readonly loading = signal(false);

  protected readonly form = this.fb.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatch },
  );

  protected async register(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error.set(null);
    this.loading.set(true);
    const { email, password } = this.form.getRawValue();
    const { error } = await this.supabase.supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth-callback` },
    });
    this.loading.set(false);
    if (error) {
      this.error.set(error.message);
      return;
    }
    this.message.set(this.transloco.translate('auth.register.success'));
  }

  // Arrow function para preservar `this` al pasarla como input al GoogleButton.
  protected readonly signUpWithGoogle = async (): Promise<void> => {
    this.error.set(null);
    const { error } = await this.supabase.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth-callback` },
    });
    if (error) this.error.set(error.message);
  };
}
