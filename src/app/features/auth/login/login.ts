import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';
import { GoogleButton } from '../../../shared/components/google-button/google-button';
import { PasswordField } from '../../../shared/components/password-field/password-field';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, GoogleButton, PasswordField],
  templateUrl: './login.html',
})
export class Login {
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly error = signal<string | null>(null);
  protected readonly loading = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  protected async login(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error.set(null);
    this.loading.set(true);
    const { email, password } = this.form.getRawValue();
    const { error } = await this.supabase.supabase.auth.signInWithPassword({ email, password });
    this.loading.set(false);
    if (error) {
      this.error.set(error.message);
      return;
    }
    this.router.navigateByUrl('/app');
  }

  // Arrow function para preservar `this` al pasarla como input al GoogleButton.
  protected readonly signInWithGoogle = async (): Promise<void> => {
    this.error.set(null);
    const { error } = await this.supabase.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth-callback` },
    });
    if (error) this.error.set(error.message);
  };
}
