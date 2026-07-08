import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { IoTDeviceResponse } from '../../../core/models/iot-device.model';
import { DevicePresenceService } from '../../../core/services/device-presence.service';
import { IoTDeviceService } from '../../../core/services/iot-device.service';
import { PermissionService } from '../../../core/services/permission.service';
import { ReadingStreamService } from '../../../core/services/reading-stream.service';
import { DeviceMonitor } from './components/device-monitor/device-monitor';
import { DeviceSelector } from './components/device-selector/device-selector';
import { StreamStatusIndicator } from './components/stream-status-indicator/stream-status-indicator';

/**
 * Live readings tab: pick a sensor and watch its measurements plot in real
 * time against its own thresholds, with connectivity and servo commands at
 * hand. Streams stay open only while the tab is on screen.
 */
@Component({
  selector: 'app-security-readings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe, DeviceMonitor, DeviceSelector, StreamStatusIndicator],
  template: `
    @if (!canView()) {
      <p class="text-sm" style="color: #64748b">{{ 'security.view_denied' | transloco }}</p>
    } @else {
      <section
        class="grid gap-6 rounded-2xl border p-6"
        style="border-color: #e2e8f0; background: #ffffff"
      >
        <header class="grid items-center gap-4" style="grid-template-columns: minmax(0, 1fr) auto">
          <div class="grid gap-1">
            <h2 class="text-lg font-semibold" style="color: #1a1a1a">
              {{ 'security.readings.title' | transloco }}
            </h2>
            <p class="text-sm" style="color: #64748b">
              {{ 'security.readings.subtitle' | transloco }}
            </p>
          </div>
          <app-stream-status-indicator />
        </header>

        @if (loading()) {
          <div class="grid gap-3" role="status" aria-busy="true">
            <span class="sr-only">{{ 'security.readings.title' | transloco }}</span>
            <div class="h-8 w-64 animate-pulse rounded-full" style="background: #f1f5f9"></div>
            <div class="h-64 animate-pulse rounded-xl" style="background: #f1f5f9"></div>
          </div>
        } @else if (devices().length === 0) {
          <div
            class="grid place-items-center rounded-xl border border-dashed p-8 text-center"
            style="border-color: #cbd5e1"
          >
            <p class="text-sm" style="color: #64748b">
              {{ 'security.readings.empty' | transloco }}
            </p>
          </div>
        } @else {
          <div class="grid items-start gap-6 sm:grid-cols-[220px_minmax(0,1fr)]">
            <app-device-selector
              [devices]="devices()"
              [selectedCode]="selectedDevice()?.code ?? null"
              (selected)="selectedCode.set($event)"
            />

            <div class="grid content-start gap-6">
              @if (selectedDevice(); as device) {
                <app-device-monitor [device]="device" />
              }
            </div>
          </div>
        }
      </section>
    }
  `,
})
export class Readings {
  private readonly deviceService = inject(IoTDeviceService);
  private readonly permissions = inject(PermissionService);
  private readonly readingStream = inject(ReadingStreamService);
  private readonly presence = inject(DevicePresenceService);

  protected readonly loading = this.deviceService.loading;
  protected readonly devices = computed(() => this.deviceService.devices() ?? []);

  /** The device the user picked; falls back to the first one available. */
  protected readonly selectedCode = signal<string | null>(null);
  protected readonly selectedDevice = computed<IoTDeviceResponse | null>(() => {
    const devices = this.devices();
    return devices.find((d) => d.code === this.selectedCode()) ?? devices[0] ?? null;
  });

  /** Seeing readings requires at least assignee in the security context. */
  protected readonly canView = computed(() => this.permissions.has('security', 'assignee'));

  constructor() {
    // Keep both live streams open only while this view is on screen.
    this.readingStream.connect();
    this.presence.connect();
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => {
      this.readingStream.disconnect();
      this.presence.disconnect();
    });
  }
}
