import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <main style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100dvh;gap:1rem;font-family:sans-serif">
      <h1>Login</h1>
      <input #email type="email" placeholder="Email" style="padding:.5rem;width:260px" />
      <input #password type="password" placeholder="Password" style="padding:.5rem;width:260px" />
      @if (error()) {
        <p style="color:red">{{ error() }}</p>
      }
      <button (click)="login(email.value, password.value)" style="padding:.5rem 1.5rem;cursor:pointer">
        Sign in
      </button>
      <a routerLink="/register">Don't have an account? Register</a>
    </main>
  `,
})
export class Login {
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);
  protected readonly error = signal<string | null>(null);

  protected async login(email: string, password: string) {
    const { error } = await this.supabase.supabase.auth.signInWithPassword({ email, password });
    if (error) {
      this.error.set(error.message);
    } else {
      this.router.navigateByUrl('/app');
    }
  }
}
