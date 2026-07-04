import { Injectable, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslocoService } from '@jsverse/transloco';
import { environment } from '../../../environments/environment';
import { OrganizationService } from './organization.service';
import { OrganizationMemberResponse, Permissions } from '../models/organization-member.model';
import { NotificationService, httpErrorMessage } from '../notifications/notification.service';

/** Members of the active organization, reloaded whenever the active org changes. */
@Injectable({ providedIn: 'root' })
export class OrganizationMemberService {
  private readonly http = inject(HttpClient);
  private readonly organizations = inject(OrganizationService);
  private readonly notifications = inject(NotificationService);
  private readonly transloco = inject(TranslocoService);

  readonly members = signal<OrganizationMemberResponse[]>([]);
  readonly loading = signal(false);

  private loadedOrgId: string | null = null;

  constructor() {
    effect(() => {
      const org = this.organizations.activeOrg();

      if (!org) {
        this.loadedOrgId = null;
        this.members.set([]);
        return;
      }
      if (org.id === this.loadedOrgId) return;

      this.loadedOrgId = org.id;
      this.load(org.id);
    });
  }

  /** Look up a member of the active org by id from the cached list. */
  memberById(memberId: string): OrganizationMemberResponse | undefined {
    return this.members().find((m) => m.id === memberId);
  }

  /** Count of members holding org-admin, used to protect the last admin. */
  adminCount(): number {
    return this.members().filter((m) => m.permissions.organizations === 'admin').length;
  }

  /**
   * Persists a member's permission levels and reflects the result in the cached
   * list. Resolves to the updated member, or null on failure.
   */
  updatePermissions(
    memberId: string,
    permissions: Permissions,
  ): Promise<OrganizationMemberResponse | null> {
    const org = this.organizations.activeOrg();
    if (!org) return Promise.resolve(null);

    return new Promise((resolve) => {
      this.http
        .put<OrganizationMemberResponse>(
          `${environment.apiUrl}/organizations/${org.id}/members/${memberId}/permissions`,
          permissions,
        )
        .subscribe({
          next: (updated) => {
            this.members.update((list) => list.map((m) => (m.id === updated.id ? updated : m)));
            this.notifications.success(
              this.transloco.translate('organizations.members.detail.saved'),
            );
            resolve(updated);
          },
          error: (err) => {
            console.error('[OrganizationMemberService] failed to update permissions', err);
            this.notifications.error(httpErrorMessage(err));
            resolve(null);
          },
        });
    });
  }

  private load(orgId: string): void {
    this.loading.set(true);
    this.http
      .get<OrganizationMemberResponse[]>(`${environment.apiUrl}/organizations/${orgId}/members`)
      .subscribe({
        next: (members) => {
          this.members.set(members);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('[OrganizationMemberService] failed to load members', err);
          this.members.set([]);
          this.loading.set(false);
          this.loadedOrgId = null;
        },
      });
  }
}
