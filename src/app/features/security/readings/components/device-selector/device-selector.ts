import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { IoTDeviceResponse } from '../../../../../core/models/iot-device.model';
import { DevicePresenceService } from '../../../../../core/services/device-presence.service';

/**
 * Vertical list of sensors to pick which one the live view focuses on. Each
 * row carries its own pulsing presence dot, so the sidebar itself reads as
 * live rather than a static menu.
 */
@Component({
  selector: 'app-device-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="grid content-start gap-1.5"
      role="tablist"
      [attr.aria-label]="transloco.translate('security.readings.select_device')"
    >
      @for (device of devices(); track device.id) {
        <button
          type="button"
          role="tab"
          [attr.aria-selected]="device.code === selectedCode()"
          (click)="selected.emit(device.code)"
          class="grid items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors"
          style="grid-template-columns: auto minmax(0, 1fr)"
          [style.border-color]="device.code === selectedCode() ? '#0E3B63' : '#e2e8f0'"
          [style.background]="device.code === selectedCode() ? '#0E3B63' : '#ffffff'"
          [style.color]="device.code === selectedCode() ? '#ffffff' : '#4A4A4F'"
        >
          <span
            class="h-2 w-2 rounded-full"
            [class.animate-pulse]="isOnline(device.code)"
            [style.background]="dotColor(device.code)"
            aria-hidden="true"
          ></span>
          <span class="truncate">{{ device.name }}</span>
        </button>
      }
    </div>
  `,
})
export class DeviceSelector {
  readonly devices = input.required<readonly IoTDeviceResponse[]>();
  readonly selectedCode = input.required<string | null>();
  readonly selected = output<string>();

  protected readonly transloco = inject(TranslocoService);
  private readonly presenceService = inject(DevicePresenceService);

  private readonly presenceByCode = computed(() => this.presenceService.byCode());

  protected isOnline(code: string): boolean {
    return this.presenceByCode().get(code)?.status === 'online';
  }

  protected dotColor(code: string): string {
    const status = this.presenceByCode().get(code)?.status;
    if (status === 'online') return '#10b981';
    if (status === 'offline') return '#ef4444';
    return '#94a3b8';
  }
}
