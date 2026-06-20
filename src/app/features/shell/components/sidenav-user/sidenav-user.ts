import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { ProfileService } from '../../../../core/services/profile.service';

@Component({
  selector: 'app-sidenav-user',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidenav-user.html',
})
export class SidenavUser {
  private readonly supabase = inject(SupabaseService);
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);

  private readonly profile = this.profileService.profile;

  protected readonly email = computed(
    () => this.profile()?.email ?? this.supabase.session()?.user?.email ?? '',
  );

  protected readonly name = computed(() => {
    const p = this.profile();
    return (
      p?.preferredName?.trim() ||
      p?.fullName?.trim() ||
      this.localPart(this.email()) ||
      'User'
    );
  });

  protected readonly avatarUrl = computed(() => this.profile()?.avatarUrl ?? '');

  protected readonly initials = computed(() => this.initialsFrom(this.name()));

  protected async logout(): Promise<void> {
    await this.supabase.supabase.auth.signOut();
    this.router.navigateByUrl('/login');
  }

  private localPart(email: string): string {
    return email.split('@')[0] ?? '';
  }

  private initialsFrom(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}
