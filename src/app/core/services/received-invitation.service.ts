import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslocoService } from '@jsverse/transloco';
import { environment } from '../../../environments/environment';
import { SupabaseService } from './supabase.service';
import { InvitationResponse } from '../models/invitation.model';
import { NotificationService, httpErrorMessage } from '../notifications/notification.service';

/**
 * Invitations addressed to the signed-in user, across every organization.
 * Backs the notification bell: reloaded on sign-in, mutated on accept/decline.
 */
@Injectable({ providedIn: 'root' })
export class ReceivedInvitationService {
  private readonly http = inject(HttpClient);
  private readonly supabase = inject(SupabaseService);
  private readonly notifications = inject(NotificationService);
  private readonly transloco = inject(TranslocoService);

  readonly invitations = signal<InvitationResponse[]>([]);
  readonly loading = signal(false);
  /** Ids currently being accepted/declined, so the UI can disable their actions. */
  readonly responding = signal<ReadonlySet<string>>(new Set());

  /** Unread badge count: invitations still awaiting the user's response. */
  readonly pendingCount = computed(
    () => this.invitations().filter((invitation) => invitation.status === 'pending').length,
  );

  private loadedId: string | null = null;

  constructor() {
    effect(() => {
      const userId = this.supabase.session()?.user?.id ?? null;

      if (!userId) {
        this.loadedId = null;
        this.invitations.set([]);
        return;
      }
      if (userId === this.loadedId) return;

      this.loadedId = userId;
      this.load();
    });
  }

  /** Accepts the invitation and reflects the server's new status locally. */
  accept(id: string): Promise<boolean> {
    return this.respond(id, 'accept');
  }

  /** Declines the invitation and reflects the server's new status locally. */
  decline(id: string): Promise<boolean> {
    return this.respond(id, 'decline');
  }

  private respond(id: string, action: 'accept' | 'decline'): Promise<boolean> {
    if (this.responding().has(id)) return Promise.resolve(false);
    this.setResponding(id, true);

    return new Promise((resolve) => {
      this.http
        .post<InvitationResponse>(`${environment.apiUrl}/invitations/${id}/${action}`, {})
        .subscribe({
          next: (updated) => {
            this.invitations.update((list) =>
              list.map((invitation) => (invitation.id === id ? updated : invitation)),
            );
            this.notifications.success(
              this.transloco.translate(`invitations.notifications.${action}ed`),
            );
            this.setResponding(id, false);
            resolve(true);
          },
          error: (err) => {
            console.error(`[ReceivedInvitationService] failed to ${action} invitation`, err);
            this.notifications.error(httpErrorMessage(err));
            this.setResponding(id, false);
            resolve(false);
          },
        });
    });
  }

  private setResponding(id: string, active: boolean): void {
    this.responding.update((set) => {
      const next = new Set(set);
      active ? next.add(id) : next.delete(id);
      return next;
    });
  }

  private load(): void {
    this.loading.set(true);
    this.http.get<InvitationResponse[]>(`${environment.apiUrl}/invitations`).subscribe({
      next: (invitations) => {
        this.invitations.set(invitations);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('[ReceivedInvitationService] failed to load invitations', err);
        this.invitations.set([]);
        this.loading.set(false);
        this.loadedId = null;
      },
    });
  }
}
