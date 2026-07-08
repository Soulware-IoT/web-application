import { Injectable, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslocoService } from '@jsverse/transloco';
import { environment } from '../../../environments/environment';
import { OrganizationService } from './organization.service';
import { InvitationResponse, InviteRequest } from '../models/invitation.model';
import { NotificationService, httpErrorMessage } from '../notifications/notification.service';

/** Invitations of the active organization, reloaded whenever it changes. */
@Injectable({ providedIn: 'root' })
export class InvitationService {
  private readonly http = inject(HttpClient);
  private readonly organizations = inject(OrganizationService);
  private readonly notifications = inject(NotificationService);
  private readonly transloco = inject(TranslocoService);

  readonly invitations = signal<InvitationResponse[]>([]);
  readonly loading = signal(false);
  readonly sending = signal(false);

  private loadedOrgId: string | null = null;

  constructor() {
    effect(() => {
      const org = this.organizations.activeOrg();

      if (!org) {
        this.loadedOrgId = null;
        this.invitations.set([]);
        return;
      }
      if (org.id === this.loadedOrgId) return;

      this.loadedOrgId = org.id;
      this.load(org.id);
    });
  }

  /**
   * Sends an invitation to `email` and syncs the cached list. Resolves to
   * `true` on success, `false` on failure.
   */
  invite(email: string): Promise<boolean> {
    const org = this.organizations.activeOrg();
    if (!org) return Promise.resolve(false);

    const body: InviteRequest = { invitedEmail: email };
    this.sending.set(true);

    return new Promise((resolve) => {
      this.http
        .post<InvitationResponse | null>(
          `${environment.apiUrl}/organizations/${org.id}/invitations`,
          body,
        )
        .subscribe({
          next: (created) => {
            // The endpoint may return 200 with the record, or with no body;
            // prepend when present, otherwise refetch to stay in sync.
            if (created) {
              this.invitations.update((list) => [created, ...list]);
            } else {
              this.load(org.id);
            }
            this.notifications.success(
              this.transloco.translate('organizations.invitations.sent'),
            );
            this.sending.set(false);
            resolve(true);
          },
          error: (err) => {
            console.error('[InvitationService] failed to send invitation', err);
            this.notifications.error(httpErrorMessage(err));
            this.sending.set(false);
            resolve(false);
          },
        });
    });
  }

  private load(orgId: string): void {
    this.loading.set(true);
    this.http
      .get<InvitationResponse[]>(`${environment.apiUrl}/organizations/${orgId}/invitations`)
      .subscribe({
        next: (invitations) => {
          this.invitations.set(invitations);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('[InvitationService] failed to load invitations', err);
          this.invitations.set([]);
          this.loading.set(false);
          this.loadedOrgId = null;
        },
      });
  }
}
