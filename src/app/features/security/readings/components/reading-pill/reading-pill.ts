import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { Reading } from '../../../../../core/models/reading.model';

/** Latest live reading of a device: severity, temperature, gas and time. */
@Component({
  selector: 'app-reading-pill',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DecimalPipe, TranslocoPipe],
  template: `
    @if (reading(); as r) {
      <p
        class="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg px-3 py-1.5 text-xs font-medium"
        [style.background]="palette().bg"
        [style.color]="palette().fg"
      >
        <span>{{ 'security.readings.severity.' + r.severity | transloco }}</span>
        @if (r.temperatureC !== undefined) {
          <span>{{ 'security.readings.temperature' | transloco: { value: r.temperatureC } }}</span>
        }
        @if (r.gasPpm !== undefined) {
          <span>
            {{ 'security.readings.gas' | transloco: { value: r.gasPpm | number: '1.0-1' } }}
          </span>
        }
        <span [style.opacity]="0.75">{{ r.occurredAt | date: 'shortTime' }}</span>
      </p>
    } @else {
      <p class="text-xs" style="color: #94a3b8">{{ 'security.readings.none' | transloco }}</p>
    }
  `,
})
export class ReadingPill {
  readonly reading = input.required<Reading | null>();

  protected readonly palette = computed(() => {
    switch (this.reading()?.severity) {
      case 'critical':
        return { bg: '#fef2f2', fg: '#b91c1c' };
      case 'warning':
        return { bg: '#fffbeb', fg: '#b45309' };
      default:
        return { bg: '#ecfdf5', fg: '#047857' };
    }
  });
}
