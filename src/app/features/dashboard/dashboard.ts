import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe],
  templateUrl: './dashboard.html',
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
