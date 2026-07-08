import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { IoTDeviceService } from '../../../../../core/services/iot-device.service';
import { PermissionService } from '../../../../../core/services/permission.service';
import { ClaimDeviceForm } from './components/claim-device-form/claim-device-form';
import { DeviceListItem } from './components/device-list-item/device-list-item';
import { DeviceListSkeleton } from './components/device-list-skeleton/device-list-skeleton';
import { QuotaIndicator } from './components/quota-indicator/quota-indicator';

/**
 * The organization's IoT sensors: activation lifecycle, connectivity,
 * thresholds, claiming and per-device commands. Live measurements live in the
 * Readings tab, linked from the header. Assumes the parent view already gated
 * visibility on the security context.
 */
@Component({
  selector: 'app-iot-devices',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslocoPipe, ClaimDeviceForm, DeviceListItem, DeviceListSkeleton, QuotaIndicator],
  template: `
    @if (loading()) {
      <app-device-list-skeleton />
    } @else {
      <section
        class="grid gap-6 rounded-2xl border p-6"
        style="border-color: #e2e8f0; background: #ffffff"
      >
        <header class="grid items-center gap-4" style="grid-template-columns: minmax(0, 1fr) auto">
          <div class="grid gap-1">
            <h2 class="text-lg font-semibold" style="color: #1a1a1a">
              {{ 'security.iot.title' | transloco }}
            </h2>
            <p class="text-sm" style="color: #64748b">{{ 'security.iot.subtitle' | transloco }}</p>
          </div>
          <div class="grid grid-flow-col items-center gap-3">
            @if (quota(); as q) {
              <app-quota-indicator [quota]="q" />
            }
            <a
              routerLink="../readings"
              class="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-50"
              style="border-color: #e2e8f0; color: #0E3B63"
            >
              {{ 'security.readings.view_live' | transloco }} →
            </a>
          </div>
        </header>

        @if (canManage()) {
          <app-claim-device-form />
        }

        @if (devices().length === 0) {
          <div
            class="grid place-items-center rounded-xl border border-dashed p-8 text-center"
            style="border-color: #cbd5e1"
          >
            <p class="text-sm" style="color: #64748b">{{ 'security.iot.empty' | transloco }}</p>
          </div>
        } @else {
          <ul class="grid gap-3">
            @for (device of devices(); track device.id) {
              <li><app-device-list-item [device]="device" /></li>
            }
          </ul>
        }
      </section>
    }
  `,
})
export class IotDevices {
  private readonly deviceService = inject(IoTDeviceService);
  private readonly permissions = inject(PermissionService);

  protected readonly loading = this.deviceService.loading;
  protected readonly quota = this.deviceService.quota;
  protected readonly devices = computed(() => this.deviceService.devices() ?? []);

  /** Claiming devices requires lieutenant in the security context. */
  protected readonly canManage = computed(() => this.permissions.has('security', 'lieutenant'));
}
