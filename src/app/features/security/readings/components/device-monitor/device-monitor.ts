import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { IoTDeviceResponse } from '../../../../../core/models/iot-device.model';
import { DevicePresenceService } from '../../../../../core/services/device-presence.service';
import { ReadingStreamService } from '../../../../../core/services/reading-stream.service';
import { PresencePill } from '../../../components/presence-pill/presence-pill';
import { ServoControls } from '../../../components/servo-controls/servo-controls';
import { ReadingPill } from '../reading-pill/reading-pill';
import { ChartSample, ReadingChart } from '../reading-chart/reading-chart';

/**
 * Live view of one sensor: identity + connectivity + latest reading + servo
 * commands, over two real-time line charts (one measure per chart, each
 * against that device's own warn/crit thresholds).
 */
@Component({
  selector: 'app-device-monitor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe, PresencePill, ReadingPill, ReadingChart, ServoControls],
  template: `
    <div class="grid gap-4 rounded-xl border p-4" style="border-color: #eef2f6; background: #ffffff">
      <div class="grid items-center gap-4" style="grid-template-columns: minmax(0, 1fr) auto">
        <div class="grid gap-0.5">
          <p class="truncate text-sm font-medium" style="color: #1a1a1a">{{ device().name }}</p>
          <p class="truncate text-xs" style="color: #64748b">
            {{ 'security.iot.code' | transloco }}: {{ device().code }}
          </p>
        </div>
        <div class="grid grid-flow-col items-center gap-2">
          <app-presence-pill [presence]="presence()" />
          <app-servo-controls [deviceId]="device().id" />
        </div>
      </div>

      <app-reading-pill [reading]="latest()" />

      <div class="grid gap-5 lg:grid-cols-2">
        <app-reading-chart
          [title]="transloco.translate('security.readings.temperature_title')"
          unit="°C"
          color="#2a78d6"
          [points]="temperature()"
          [warn]="device().thresholds?.temperature?.warn ?? null"
          [crit]="device().thresholds?.temperature?.crit ?? null"
          [live]="live()"
        />
        <app-reading-chart
          [title]="transloco.translate('security.readings.gas_title')"
          unit="PPM"
          color="#4a3aa7"
          [points]="gas()"
          [warn]="device().thresholds?.gas?.warn ?? null"
          [crit]="device().thresholds?.gas?.crit ?? null"
          [live]="live()"
        />
      </div>
    </div>
  `,
})
export class DeviceMonitor {
  readonly device = input.required<IoTDeviceResponse>();

  protected readonly transloco = inject(TranslocoService);
  private readonly readingStream = inject(ReadingStreamService);
  private readonly presenceService = inject(DevicePresenceService);

  private readonly history = computed(
    () => this.readingStream.historyByCode().get(this.device().code) ?? [],
  );

  protected readonly latest = computed(
    () => this.readingStream.latestByCode().get(this.device().code) ?? null,
  );

  protected readonly presence = computed(
    () => this.presenceService.byCode().get(this.device().code) ?? null,
  );

  /** Whether the readings stream is currently connected — drives the charts' live dot. */
  protected readonly live = computed(() => this.readingStream.status() === 'live');

  protected readonly temperature = computed<ChartSample[]>(() =>
    this.history()
      .filter((r) => r.temperatureC !== undefined)
      .map((r) => ({ at: r.occurredAt, value: r.temperatureC as number })),
  );

  protected readonly gas = computed<ChartSample[]>(() =>
    this.history()
      .filter((r) => r.gasPpm !== undefined)
      .map((r) => ({ at: r.occurredAt, value: r.gasPpm as number })),
  );
}
