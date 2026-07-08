import { Injectable, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslocoService } from '@jsverse/transloco';
import { environment } from '../../../environments/environment';
import { OrganizationService } from './organization.service';
import { NotificationService, httpErrorMessage } from '../notifications/notification.service';
import {
  ClaimDeviceRequest,
  IoTDeviceListResponse,
  IoTDeviceResponse,
  Quota,
  ServoCommand,
  ServoCommandRequest,
  UpdateIoTDeviceRequest,
} from '../models/iot-device.model';

/**
 * IoT devices of the active organization, plus the plan quota. The list
 * reloads whenever the active org changes; `claim`/`update` keep the cached
 * list and quota in sync.
 */
@Injectable({ providedIn: 'root' })
export class IoTDeviceService {
  private readonly http = inject(HttpClient);
  private readonly orgService = inject(OrganizationService);
  private readonly notifications = inject(NotificationService);
  private readonly transloco = inject(TranslocoService);

  readonly devices = signal<IoTDeviceResponse[] | null>(null);
  readonly quota = signal<Quota | null>(null);
  readonly loading = signal(true);
  readonly claiming = signal(false);
  /** Id of the device with a PATCH in flight; gates per-row action buttons. */
  readonly updatingId = signal<string | null>(null);
  /** Id of the device with a servo command in flight; gates the servo buttons. */
  readonly servoingId = signal<string | null>(null);

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
        this.devices.set(null);
        this.quota.set(null);
        this.loading.set(true);
      }
    });
  }

  /**
   * Claims the device identified by `request.code` for the active org and
   * syncs the cached list and quota. Resolves to `true` on success.
   */
  claim(request: ClaimDeviceRequest): Promise<boolean> {
    const org = this.orgService.activeOrg();
    if (!org) return Promise.resolve(false);

    this.claiming.set(true);
    return new Promise((resolve) => {
      this.http
        .post<IoTDeviceResponse>(
          `${environment.apiUrl}/organizations/${org.id}/iot-devices`,
          request,
        )
        .subscribe({
          next: (created) => {
            this.devices.update((list) => [created, ...(list ?? [])]);
            this.quota.update((q) => (q ? { ...q, used: q.used + 1 } : q));
            this.notifications.success(this.transloco.translate('security.iot.claim.claimed'));
            this.claiming.set(false);
            resolve(true);
          },
          error: (err) => {
            console.error('[IoTDeviceService] failed to claim device', err);
            this.notifications.error(httpErrorMessage(err));
            this.claiming.set(false);
            resolve(false);
          },
        });
    });
  }

  /**
   * Applies a partial update (name, thresholds, or an activate/deactivate
   * command) and syncs the cached list. Resolves to `true` on success.
   */
  update(id: string, request: UpdateIoTDeviceRequest): Promise<boolean> {
    this.updatingId.set(id);
    return new Promise((resolve) => {
      this.http
        .patch<IoTDeviceResponse>(`${environment.apiUrl}/iot-devices/${id}`, request)
        .subscribe({
          next: (updated) => {
            this.devices.update(
              (list) => list?.map((device) => (device.id === id ? updated : device)) ?? null,
            );
            this.notifications.success(this.transloco.translate('security.iot.updated'));
            this.updatingId.set(null);
            resolve(true);
          },
          error: (err) => {
            console.error('[IoTDeviceService] failed to update device', err);
            this.notifications.error(httpErrorMessage(err));
            this.updatingId.set(null);
            resolve(false);
          },
        });
    });
  }

  /**
   * Sends a start/stop command to the device's servo actuator. The endpoint
   * returns no body — success just means the command was accepted.
   */
  servo(id: string, command: ServoCommand): Promise<boolean> {
    const body: ServoCommandRequest = { command };
    this.servoingId.set(id);
    return new Promise((resolve) => {
      this.http.post<void>(`${environment.apiUrl}/iot-devices/${id}/servo`, body).subscribe({
        next: () => {
          this.notifications.success(this.transloco.translate('security.iot.servo.sent'));
          this.servoingId.set(null);
          resolve(true);
        },
        error: (err) => {
          console.error('[IoTDeviceService] failed to send servo command', err);
          this.notifications.error(httpErrorMessage(err));
          this.servoingId.set(null);
          resolve(false);
        },
      });
    });
  }

  private load(orgId: string): void {
    this.loading.set(true);
    this.http
      .get<IoTDeviceListResponse>(`${environment.apiUrl}/organizations/${orgId}/iot-devices`)
      .subscribe({
        next: (res) => {
          this.devices.set(res.devices ?? []);
          this.quota.set(res.quota ?? null);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('[IoTDeviceService] failed to load IoT devices', err);
          this.devices.set([]);
          this.quota.set(null);
          this.loading.set(false);
          this.loadedOrgId = null; // allow a retry on next org change
        },
      });
  }
}
