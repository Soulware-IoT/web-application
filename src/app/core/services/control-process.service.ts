import { Injectable, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslocoService } from '@jsverse/transloco';
import { environment } from '../../../environments/environment';
import { OrganizationService } from './organization.service';
import { ControlProcessResponse, CreateControlProcessRequest } from '../models/control-process.model';
import { NotificationService, httpErrorMessage } from '../notifications/notification.service';

@Injectable({ providedIn: 'root' })
export class ControlProcessService {
  private readonly http = inject(HttpClient);
  private readonly orgService = inject(OrganizationService);
  private readonly notifications = inject(NotificationService);
  private readonly transloco = inject(TranslocoService);

  readonly processes = signal<ControlProcessResponse[] | null>(null);
  readonly loading = signal(true);

  private loadedOrgId: string | null = null;

  constructor() {
    // Reload whenever the active organization changes.
    effect(() => {
      const orgId = this.orgService.activeOrg()?.id ?? null;
      if (orgId === this.loadedOrgId) return;

      this.loadedOrgId = orgId;
      if (orgId) {
        this.load(orgId);
      } else {
        this.processes.set(null);
        this.loading.set(true);
      }
    });
  }

  /** Creates a control process under the active organization and appends it to the list. */
  create(name: string): Promise<ControlProcessResponse | null> {
    const orgId = this.orgService.activeOrg()?.id;
    if (!orgId) return Promise.resolve(null);

    return new Promise((resolve) => {
      const body: CreateControlProcessRequest = { name };
      this.http
        .post<ControlProcessResponse>(
          `${environment.apiUrl}/organizations/${orgId}/control-processes`,
          body,
        )
        .subscribe({
          next: (created) => {
            this.processes.update((list) => [...(list ?? []), created]);
            this.notifications.success(
              this.transloco.translate('internalControl.notifications.process_created'),
            );
            resolve(created);
          },
          error: (err) => {
            console.error('[ControlProcessService] failed to create control process', err);
            this.notifications.error(httpErrorMessage(err));
            resolve(null);
          },
        });
    });
  }

  /** Renames a control process and reflects the server's response in the list. */
  rename(id: string, name: string): void {
    this.http
      .patch<ControlProcessResponse>(`${environment.apiUrl}/control-processes/${id}`, { name })
      .subscribe({
        next: (updated) => {
          this.processes.update((list) =>
            list?.map((p) => (p.id === id ? updated : p)) ?? list,
          );
          this.notifications.success(this.transloco.translate('internalControl.notifications.process_renamed'));
        },
        error: (err) => {
          console.error('[ControlProcessService] failed to rename control process', err);
          this.notifications.error(httpErrorMessage(err));
        },
      });
  }

  private load(orgId: string): void {
    this.loading.set(true);
    this.http
      .get<ControlProcessResponse[]>(
        `${environment.apiUrl}/organizations/${orgId}/control-processes`,
      )
      .subscribe({
        next: (processes) => {
          this.processes.set(processes);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('[ControlProcessService] failed to load control processes', err);
          this.processes.set([]);
          this.loading.set(false);
          this.loadedOrgId = null; // allow a retry on next org change
        },
      });
  }
}
