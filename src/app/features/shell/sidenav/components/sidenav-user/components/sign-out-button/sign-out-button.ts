import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../../../../../core/services/supabase.service';

@Component({
  selector: 'app-sign-out-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      (click)="signOut()"
      class="grid grid-cols-[18px_1fr] items-center gap-3 rounded-[2px] px-3 py-2 text-sm font-medium transition-colors hover:bg-red-50 hover:text-red-700"
      style="color: #4A4A4F"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18" height="18" fill="none" viewBox="0 0 24 24"
        stroke="currentColor" stroke-width="1.75"
        stroke-linecap="round" stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
      <span>Sign out</span>
    </button>
  `,
})
export class SignOutButton {
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);

  protected async signOut(): Promise<void> {
    await this.supabase.supabase.auth.signOut();
    this.router.navigateByUrl('/login');
  }
}
