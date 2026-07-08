import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

/** One time-stamped sample to plot. */
export interface ChartSample {
  at: string;
  value: number;
}

const VIEW_W = 600;
const VIEW_H = 170;
const PAD_X = 8;
const PAD_Y = 14;

/**
 * Real-time single-series line chart: 2px line over a recessive baseline,
 * dashed warn/crit reference lines (labelled, so state is never color-alone),
 * the latest value direct-labelled, and a crosshair tooltip on hover. One
 * measure per chart — two measures never share an axis.
 */
@Component({
  selector: 'app-reading-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DecimalPipe, TranslocoPipe],
  template: `
    <figure class="grid gap-2">
      <figcaption
        class="grid grid-flow-col items-baseline justify-between gap-2 text-xs font-medium"
        style="color: #4A4A4F"
      >
        <span class="grid grid-flow-col items-center gap-1.5">
          @if (live()) {
            <span
              class="h-1.5 w-1.5 animate-pulse rounded-full"
              style="background: #10b981"
              aria-hidden="true"
            ></span>
          }
          {{ title() }}
        </span>
        @if (latest(); as last) {
          <span [style.color]="color()" class="text-sm font-semibold">
            {{ last.value | number: '1.0-1' }} {{ unit() }}
          </span>
        }
      </figcaption>

      @if (points().length >= 2) {
        <div class="relative" (mouseleave)="hoverIndex.set(null)">
          <svg
            class="block w-full rounded-lg border"
            style="border-color: #eef2f6; background: #fcfdfe"
            [attr.viewBox]="'0 0 ' + viewW + ' ' + viewH"
            role="img"
            [attr.aria-label]="ariaLabel()"
            (mousemove)="onHover($event)"
          >
            <!-- Recessive min/max gridlines -->
            <line [attr.x1]="padX" [attr.x2]="viewW - padX" [attr.y1]="padY" [attr.y2]="padY"
                  stroke="#eef2f6" stroke-width="1" />
            <line [attr.x1]="padX" [attr.x2]="viewW - padX" [attr.y1]="viewH - padY" [attr.y2]="viewH - padY"
                  stroke="#eef2f6" stroke-width="1" />

            <!-- Threshold reference lines: dashed + labelled, never color-alone -->
            @if (warnY(); as y) {
              <line [attr.x1]="padX" [attr.x2]="viewW - padX" [attr.y1]="y" [attr.y2]="y"
                    stroke="#b45309" stroke-width="1" stroke-dasharray="6 4" opacity="0.6" />
              <text [attr.x]="viewW - padX" [attr.y]="y - 4" text-anchor="end"
                    font-size="10" fill="#b45309">{{ 'security.iot.edit.warn' | transloco }}</text>
            }
            @if (critY(); as y) {
              <line [attr.x1]="padX" [attr.x2]="viewW - padX" [attr.y1]="y" [attr.y2]="y"
                    stroke="#b91c1c" stroke-width="1" stroke-dasharray="6 4" opacity="0.6" />
              <text [attr.x]="viewW - padX" [attr.y]="y - 4" text-anchor="end"
                    font-size="10" fill="#b91c1c">{{ 'security.iot.edit.crit' | transloco }}</text>
            }

            <!-- The series -->
            <polyline [attr.points]="path()" fill="none" [attr.stroke]="color()"
                      stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />

            <!-- Latest point marker -->
            @if (coords().length > 0) {
              <circle [attr.cx]="coords()[coords().length - 1].x"
                      [attr.cy]="coords()[coords().length - 1].y"
                      r="3.5" [attr.fill]="color()" stroke="#ffffff" stroke-width="1.5" />
            }

            <!-- Crosshair -->
            @if (hovered(); as h) {
              <line [attr.x1]="h.x" [attr.x2]="h.x" [attr.y1]="padY" [attr.y2]="viewH - padY"
                    stroke="#94a3b8" stroke-width="1" stroke-dasharray="3 3" />
              <circle [attr.cx]="h.x" [attr.cy]="h.y" r="4" [attr.fill]="color()"
                      stroke="#ffffff" stroke-width="2" />
            }
          </svg>

          @if (hovered(); as h) {
            <div
              class="pointer-events-none absolute -translate-x-1/2 rounded-lg border px-2 py-1 text-xs shadow-sm"
              style="border-color: #e2e8f0; background: #ffffff; color: #1a1a1a; top: 0"
              [style.left.%]="(h.x / viewW) * 100"
            >
              <span class="font-semibold">{{ h.value | number: '1.0-1' }} {{ unit() }}</span>
              <span style="color: #64748b"> · {{ h.at | date: 'mediumTime' }}</span>
            </div>
          }
        </div>
      } @else {
        <div
          class="grid h-24 place-items-center rounded-lg border border-dashed text-xs"
          style="border-color: #cbd5e1; color: #94a3b8"
        >
          {{ 'security.readings.waiting' | transloco }}
        </div>
      }
    </figure>
  `,
})
export class ReadingChart {
  readonly title = input.required<string>();
  readonly unit = input.required<string>();
  readonly color = input.required<string>();
  readonly points = input.required<readonly ChartSample[]>();
  readonly warn = input<number | null>(null);
  readonly crit = input<number | null>(null);
  /** Whether the stream is currently connected — drives the pulsing "live" dot. */
  readonly live = input(false);

  protected readonly viewW = VIEW_W;
  protected readonly viewH = VIEW_H;
  protected readonly padX = PAD_X;
  protected readonly padY = PAD_Y;

  protected readonly hoverIndex = signal<number | null>(null);

  protected readonly latest = computed(() => this.points().at(-1) ?? null);

  /** Y domain covering the data and both thresholds, with headroom. */
  private readonly domain = computed(() => {
    const values = this.points().map((p) => p.value);
    for (const bound of [this.warn(), this.crit()]) {
      if (bound !== null) values.push(bound);
    }
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    return { min: min - span * 0.1, max: max + span * 0.1 };
  });

  private y(value: number): number {
    const { min, max } = this.domain();
    const t = (value - min) / (max - min);
    return VIEW_H - PAD_Y - t * (VIEW_H - 2 * PAD_Y);
  }

  protected readonly coords = computed(() => {
    const samples = this.points();
    const step = (VIEW_W - 2 * PAD_X) / Math.max(1, samples.length - 1);
    return samples.map((s, i) => ({ x: PAD_X + i * step, y: this.y(s.value), ...s }));
  });

  protected readonly path = computed(() =>
    this.coords()
      .map((c) => `${c.x},${c.y}`)
      .join(' '),
  );

  protected readonly warnY = computed(() => {
    const warn = this.warn();
    return warn === null ? null : this.y(warn);
  });

  protected readonly critY = computed(() => {
    const crit = this.crit();
    return crit === null ? null : this.y(crit);
  });

  protected readonly hovered = computed(() => {
    const index = this.hoverIndex();
    return index === null ? null : (this.coords()[index] ?? null);
  });

  protected readonly ariaLabel = computed(() => {
    const last = this.latest();
    return last ? `${this.title()}: ${last.value} ${this.unit()}` : this.title();
  });

  protected onHover(event: MouseEvent): void {
    const svg = event.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * VIEW_W;
    const coords = this.coords();
    if (coords.length === 0) return;
    let nearest = 0;
    for (let i = 1; i < coords.length; i++) {
      if (Math.abs(coords[i].x - x) < Math.abs(coords[nearest].x - x)) nearest = i;
    }
    this.hoverIndex.set(nearest);
  }
}
