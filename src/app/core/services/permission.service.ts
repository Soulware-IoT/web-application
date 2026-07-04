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
 * Exposes the caller's permission levels in the active organization, derived
 * from the org's member list. This scopes *what the UI offers* — it is never
 * the security boundary; the backend re-checks every request against the DB.
 */
@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly http = inject(HttpClient);
  private readonly supabase = inject(SupabaseService);
  private readonly organizations = inject(OrganizationService);

  /** Caller's levels per context in the active org; `none` everywhere until loaded. */
  readonly permissions = signal<Permissions>(NO_PERMISSIONS);
  readonly loading = signal(false);

  private loadedOrgId: string | null = null;

  constructor() {
    effect(() => {
      const org = this.organizations.activeOrg();
      const userId = this.supabase.session()?.user?.id ?? null;

      if (!org || !userId) {
        this.loadedOrgId = null;
        this.permissions.set(NO_PERMISSIONS);
        return;
      }
      if (org.id === this.loadedOrgId) return;

      this.loadedOrgId = org.id;
      this.load(org.id, userId);
    });
  }

  /** Reactive gate: is the caller at least `min` in `context`? Reads the signal. */
  has(context: PermissionContext, min: PermissionLevel): boolean {
    return meets(this.permissions()[context], min);
  }

  private load(orgId: string, userId: string): void {
    this.loading.set(true);
    this.http
      .get<OrganizationMemberResponse[]>(`${environment.apiUrl}/organizations/${orgId}/members`)
      .subscribe({
        next: (members) => {
          const me = members.find((m) => m.profile.id === userId);
          this.permissions.set(me?.permissions ?? NO_PERMISSIONS);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('[PermissionService] failed to load members', err);
          this.permissions.set(NO_PERMISSIONS);
          this.loading.set(false);
          this.loadedOrgId = null;
        },
      });
  }
}
