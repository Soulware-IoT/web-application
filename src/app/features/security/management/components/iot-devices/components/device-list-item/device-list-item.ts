import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { IoTDeviceResponse } from '../../../../../../../core/models/iot-device.model';
import { DevicePresenceService } from '../../../../../../../core/services/device-presence.service';
import { IoTDeviceService } from '../../../../../../../core/services/iot-device.service';
import { PermissionService } from '../../../../../../../core/services/permission.service';
import { ModalService } from '../../../../../../../core/modal/modal.service';
import {
  ConfirmData,
  ConfirmModal,
} from '../../../../../../../core/modal/confirm-modal/confirm-modal';
import { PresencePill } from '../../../../../components/presence-pill/presence-pill';
import { ServoControls } from '../../../../../components/servo-controls/servo-controls';
import { DeviceStatusBadge } from '../device-status-badge/device-status-badge';
import { EditDeviceModal } from '../edit-device-modal/edit-device-modal';

/**
 * A single IoT device row mapping everything the API exposes: identity,
 * activation lifecycle, live connectivity, alarm thresholds, plus commands —
 * servo start/stop for any viewer, edit and activate/deactivate (icon
 * buttons) for lieutenants.
 */
@Component({
  selector: 'app-device-list-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe, DeviceStatusBadge, PresencePill, ServoControls],
  template: `
    <div
      class="grid items-center gap-4 rounded-xl border p-4"
      style="border-color: #eef2f6; background: #ffffff; grid-template-columns: minmax(0, 1fr) auto"
    >
      <div class="grid h-full items-center gap-4" style="grid-template-columns: auto minmax(0, 1fr)">
        <span
          class="grid h-12 w-12 place-items-center self-center rounded-xl"
          style="background: #eef4fb; color: #0E3B63"
          aria-hidden="true"
        >
          <svg
            class="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="7" y="7" width="10" height="10" rx="2" />
            <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5 8 8M18.5 5.5 16 8M5.5 18.5 8 16M18.5 18.5 16 16" />
          </svg>
        </span>
        <div class="grid gap-0.5">
          <p class="truncate text-sm font-medium" style="color: #1a1a1a">{{ device().name }}</p>
          <p class="truncate text-xs" style="color: #64748b">
            {{ 'security.iot.code' | transloco }}: {{ device().code }}
          </p>
          @if (device().thresholds; as t) {
            <p class="truncate text-xs" style="color: #94a3b8">
              {{
                'security.iot.thresholds_summary'
                  | transloco
                    : {
                        tempWarn: t.temperature?.warn ?? '—',
                        tempCrit: t.temperature?.crit ?? '—',
                        gasWarn: t.gas?.warn ?? '—',
                        gasCrit: t.gas?.crit ?? '—',
                      }
              }}
            </p>
          }
        </div>
      </div>

      <div class="grid content-center justify-items-end gap-2.5">
        <div class="grid grid-flow-col items-center gap-2">
          <app-presence-pill [presence]="presence()" />
          <app-device-status-badge [status]="device().status" />
        </div>

        <div class="grid grid-flow-col items-center gap-2">
          <app-servo-controls [deviceId]="device().id" />

          @if (canManage()) {
            <span class="h-4 w-px" style="background: #e2e8f0" aria-hidden="true"></span>
            <button
              type="button"
              (click)="edit()"
              [disabled]="busy()"
              [title]="'security.iot.actions.edit' | transloco"
              [attr.aria-label]="'security.iot.actions.edit' | transloco"
              class="grid h-8 w-8 place-items-center rounded-lg border transition-colors hover:bg-gray-50 disabled:opacity-50"
              style="border-color: #e2e8f0; color: #0E3B63"
            >
              <svg
                class="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 3 21.5l1-4.5L17 3Z" />
              </svg>
            </button>
            <button
              type="button"
              (click)="toggleStatus()"
              [disabled]="busy()"
              [title]="
                (active() ? 'security.iot.actions.deactivate' : 'security.iot.actions.activate')
                  | transloco
              "
              [attr.aria-label]="
                (active() ? 'security.iot.actions.deactivate' : 'security.iot.actions.activate')
                  | transloco
              "
              class="grid h-8 w-8 place-items-center rounded-lg border transition-colors disabled:opacity-50"
              [class.hover:bg-red-50]="active()"
              [class.hover:bg-emerald-50]="!active()"
              [style.border-color]="active() ? '#fecaca' : '#a7f3d0'"
              [style.color]="active() ? '#b91c1c' : '#047857'"
            >
              <svg
                class="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3v8M7 6.5a7 7 0 1 0 10 0" />
              </svg>
            </button>
          }
        </div>
      </div>
    </div>
  `,
})
export class DeviceListItem {
  readonly device = input.required<IoTDeviceResponse>();

  private readonly deviceService = inject(IoTDeviceService);
  private readonly presenceService = inject(DevicePresenceService);
  private readonly permissions = inject(PermissionService);
  private readonly modal = inject(ModalService);
  private readonly transloco = inject(TranslocoService);

  /** Connectivity of this device, if it ever reported presence. */
  protected readonly presence = computed(
    () => this.presenceService.byCode().get(this.device().code) ?? null,
  );

  /** Managing a device (edit / lifecycle commands) requires lieutenant. */
  protected readonly canManage = computed(() => this.permissions.has('security', 'lieutenant'));

  protected readonly active = computed(() => this.device().status === 'active');
  protected readonly busy = computed(() => this.deviceService.updatingId() === this.device().id);

  protected edit(): void {
    this.modal.open(EditDeviceModal, {
      title: this.transloco.translate('security.iot.edit.title'),
      data: this.device(),
    });
  }

  /** Sends the activate/deactivate command; deactivation asks first. */
  protected async toggleStatus(): Promise<void> {
    const device = this.device();
    const next = this.active() ? 'inactive' : 'active';

    if (next === 'inactive') {
      const data: ConfirmData = {
        message: this.transloco.translate('security.iot.actions.deactivate_confirm', {
          name: device.name,
        }),
        confirmLabel: this.transloco.translate('security.iot.actions.deactivate'),
        destructive: true,
      };
      const confirmed = await this.modal.open<boolean, ConfirmData>(ConfirmModal, {
        title: this.transloco.translate('security.iot.actions.deactivate_title'),
        data,
      }).closed;
      if (!confirmed) return;
    }

    await this.deviceService.update(device.id, { status: next });
  }
}
