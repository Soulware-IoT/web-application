import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { DeviceStatus } from '../../../../../../../core/models/iot-device.model';

/**
 * Coloured pill reflecting a device's activation lifecycle — deliberately
 * labelled via tooltip so it isn't mistaken for online/offline connectivity.
 */
@Component({
  selector: 'app-device-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe],
  template: `
    <span
      class="rounded-full px-3 py-1 text-xs font-medium"
      [style.background]="palette().bg"
      [style.color]="palette().fg"
      [title]="'security.status.label' | transloco"
    >
      {{ 'security.status.' + status() | transloco }}
    </span>
  `,
})
export class DeviceStatusBadge {
  readonly status = input.required<DeviceStatus>();

  protected readonly palette = computed(() => {
    switch (this.status()) {
      case 'active':
        return { bg: '#ecfdf5', fg: '#047857' };
      case 'inactive':
        return { bg: '#fef2f2', fg: '#b91c1c' };
      default:
        return { bg: '#f1f5f9', fg: '#475569' };
    }
  });
}
