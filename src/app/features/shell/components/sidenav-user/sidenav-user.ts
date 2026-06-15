import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../../core/services/supabase.service';

@Component({
  selector: 'app-sidenav-user',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidenav-user.html',
})
export class SidenavUser {
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);

  protected readonly name = 'Admin User';
  protected readonly email = 'admin@cocina360.com';
  protected readonly initials = 'AU';

  protected async logout(): Promise<void> {
    await this.supabase.supabase.auth.signOut();
    this.router.navigateByUrl('/login');
  }
}
