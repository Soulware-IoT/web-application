import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <main style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100dvh;gap:1rem;font-family:sans-serif">
      <h1>Register</h1>
      <input #email type="email" placeholder="Email" style="padding:.5rem;width:260px" />
      <input #password type="password" placeholder="Password" style="padding:.5rem;width:260px" />
      @if (message()) {
        <p style="color:green">{{ message() }}</p>
      }
      @if (error()) {
        <p style="color:red">{{ error() }}</p>
      }
      <button (click)="register(email.value, password.value)" style="padding:.5rem 1.5rem;cursor:pointer">
        Create account
      </button>
      <a routerLink="/login">Already have an account? Sign in</a>
    </main>
  `,
})
export class Register {
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);
  protected readonly error = signal<string | null>(null);
  protected readonly message = signal<string | null>(null);

  protected async register(email: string, password: string) {
    const { error } = await this.supabase.supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth-callback` },
    });
    if (error) {
      this.error.set(error.message);
    } else {
      this.message.set('Check your email to confirm your account.');
    }
  }
}
