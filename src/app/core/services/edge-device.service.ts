import { Injectable, effect, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { TranslocoService } from '@jsverse/transloco';
import { environment } from '../../../environments/environment';
import { OrganizationService } from './organization.service';
import { NotificationService, httpErrorMessage } from '../notifications/notification.service';
import {
  ClaimEdgeDeviceRequest,
  EdgeDeviceResponse,
  UpdateEdgeDeviceRequest,
} from '../models/edge-device.model';

/**
 * The active organization's single edge device (the gateway relaying IoT
 * readings). Each org owns at most one: a 404 from the backend means none is
 * registered yet, which is a normal state — not a failure.
 */
@Injectable({ providedIn: 'root' })
export class EdgeDeviceService {
  private readonly http = inject(HttpClient);
  private readonly orgService = inject(OrganizationService);
  private readonly notifications = inject(NotificationService);
  private readonly transloco = inject(TranslocoService);

  /** The org's edge device; `null` while loading or when none is registered. */
  readonly device = signal<EdgeDeviceResponse | null>(null);
  readonly loading = signal(true);
  /** True when the load failed for a reason other than "not registered". */
  readonly loadFailed = signal(false);
  readonly saving = signal(false);

  private loadedOrgId: string | null = null;

  constructor() {
    // Reload whenever the active organization changes.
    effect(() => {
      const orgId = this.orgService.activeOrg()?.id ?? null;
      if (orgId === this.loadedOrgId) return;

      this.loadedOrgId = orgId;
      this.device.set(null);
      this.loadFailed.set(false);
      if (orgId) {
        this.load(orgId);
      } else {
        this.loading.set(true);
      }
    });
  }

  /**
   * Registers the org's edge device (only one allowed; the backend rejects a
   * second claim). Resolves to `true` on success.
   */
  claim(request: ClaimEdgeDeviceRequest): Promise<boolean> {
    const org = this.orgService.activeOrg();
    if (!org) return Promise.resolve(false);

    this.saving.set(true);
    return new Promise((resolve) => {
      this.http
        .post<EdgeDeviceResponse>(
          `${environment.apiUrl}/organizations/${org.id}/edge-device`,
          request,
        )
        .subscribe({
          next: (created) => {
            this.device.set(created);
            this.notifications.success(this.transloco.translate('security.edge.registered'));
            this.saving.set(false);
            resolve(true);
          },
          error: (err) => {
            console.error('[EdgeDeviceService] failed to register edge device', err);
            this.notifications.error(httpErrorMessage(err));
            this.saving.set(false);
            resolve(false);
          },
        });
    });
  }

  /**
   * Applies a partial update (rename or an activate/deactivate command) to
   * the org's edge device. Resolves to `true` on success.
   */
  update(id: string, request: UpdateEdgeDeviceRequest): Promise<boolean> {
    this.saving.set(true);
    return new Promise((resolve) => {
      this.http
        .patch<EdgeDeviceResponse>(`${environment.apiUrl}/edge-device/${id}`, request)
        .subscribe({
          next: (updated) => {
            this.device.set(updated);
            this.notifications.success(this.transloco.translate('security.edge.updated'));
            this.saving.set(false);
            resolve(true);
          },
          error: (err) => {
            console.error('[EdgeDeviceService] failed to update edge device', err);
            this.notifications.error(httpErrorMessage(err));
            this.saving.set(false);
            resolve(false);
          },
        });
    });
  }

  private load(orgId: string): void {
    this.loading.set(true);
    this.http
      .get<EdgeDeviceResponse>(`${environment.apiUrl}/organizations/${orgId}/edge-device`)
      .subscribe({
        next: (device) => {
          this.device.set(device);
          this.loading.set(false);
        },
        error: (err) => {
          // 404 = no edge device registered yet; anything else is a real failure.
          if (err instanceof HttpErrorResponse && err.status === 404) {
            this.device.set(null);
          } else {
            console.error('[EdgeDeviceService] failed to load edge device', err);
            this.loadFailed.set(true);
            this.loadedOrgId = null; // allow a retry on next org change
          }
          this.loading.set(false);
        },
      });
  }
}
