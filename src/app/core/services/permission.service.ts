import { Injectable, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SupabaseService } from './supabase.service';
import { OrganizationService } from './organization.service';
import {
  NO_PERMISSIONS,
  OrganizationMemberResponse,
  PermissionContext,
  PermissionLevel,
  Permissions,
  meets,
} from '../models/organization-member.model';

/**
 * Exposes the caller's own membership (profile + permission levels) in the
 * active organization, fetched from `/members/me`. Permissions scope *what the
 * UI offers* — never the security boundary; the backend re-checks every request.
 */
@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly http = inject(HttpClient);
  private readonly supabase = inject(SupabaseService);
  private readonly organizations = inject(OrganizationService);

  /** The caller's own member record in the active org; `null` until loaded. */
  readonly member = signal<OrganizationMemberResponse | null>(null);
  /** Caller's levels per context in the active org; `none` everywhere until loaded. */
  readonly permissions = signal<Permissions>(NO_PERMISSIONS);
  readonly loading = signal(false);

  private loadedOrgId: string | null = null;

  constructor() {
    effect(() => {
      const org = this.organizations.activeOrg();
      const loggedIn = !!this.supabase.session()?.user?.id;

      if (!org || !loggedIn) {
        this.loadedOrgId = null;
        this.member.set(null);
        this.permissions.set(NO_PERMISSIONS);
        return;
      }
      if (org.id === this.loadedOrgId) return;

      this.loadedOrgId = org.id;
      this.load(org.id);
    });
  }

  /** Reactive gate: is the caller at least `min` in `context`? Reads the signal. */
  has(context: PermissionContext, min: PermissionLevel): boolean {
    return meets(this.permissions()[context], min);
  }

  private load(orgId: string): void {
    this.loading.set(true);
    this.http
      .get<OrganizationMemberResponse>(`${environment.apiUrl}/organizations/${orgId}/members/me`)
      .subscribe({
        next: (me) => {
          this.member.set(me);
          this.permissions.set(me.permissions ?? NO_PERMISSIONS);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('[PermissionService] failed to load own membership', err);
          this.member.set(null);
          this.permissions.set(NO_PERMISSIONS);
          this.loading.set(false);
          this.loadedOrgId = null;
        },
      });
  }
}
