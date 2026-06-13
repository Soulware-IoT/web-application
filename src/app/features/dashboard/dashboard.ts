import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100dvh;gap:1rem;font-family:sans-serif">
      <h1>Dashboard</h1>
      <p>You are authenticated. This is a protected page.</p>
      <p>Logged in as: <strong>{{ email() }}</strong></p>
      <button (click)="logout()" style="padding:.5rem 1.5rem;cursor:pointer">Sign out</button>
    </main>
  `,
})
export class Dashboard {
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);

  protected email() {
    return this.supabase.session()?.user.email ?? 'unknown';
  }

  protected async logout() {
    await this.supabase.supabase.auth.signOut();
    this.router.navigateByUrl('/login');
  }
}
