import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { DevicePresenceResponse } from '../../../../core/models/device-presence.model';

/**
 * Connectivity pill: dot + Online/Offline (or "No signal" when the device has
 * never reported presence). Deliberately distinct from the activation-status
 * badge — this reflects whether the device is reachable right now. `dark`
 * switches to colors tuned for the edge hero background.
 */
@Component({
  selector: 'app-presence-pill',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, TranslocoPipe],
  template: `
    <span
      class="grid grid-flow-col items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
      [style.background]="palette().bg"
      [style.color]="palette().fg"
      [title]="
        presence()?.since
          ? ('security.presence.since'
            | transloco: { time: (presence()?.since | date: 'short') ?? '' })
          : null
      "
    >
      <span
        class="h-1.5 w-1.5 rounded-full"
        [class.animate-pulse]="state() === 'online'"
        [style.background]="palette().dot"
        aria-hidden="true"
      ></span>
      {{ 'security.presence.' + state() | transloco }}
    </span>
  `,
})
export class PresencePill {
  /** Presence record for the device, or `null` when none has arrived. */
  readonly presence = input.required<DevicePresenceResponse | null>();
  /** Use the palette tuned for the dark edge hero background. */
  readonly dark = input(false);

  protected readonly state = computed(() => this.presence()?.status ?? 'unknown');

  protected readonly palette = computed(() => {
    if (this.dark()) {
      switch (this.state()) {
        case 'online':
          return { bg: 'rgba(52,211,153,0.15)', fg: '#a7f3d0', dot: '#34d399' };
        case 'offline':
          return { bg: 'rgba(248,113,113,0.15)', fg: '#fecaca', dot: '#f87171' };
        default:
          return { bg: 'rgba(148,163,184,0.2)', fg: '#e2e8f0', dot: '#94a3b8' };
      }
    }
    switch (this.state()) {
      case 'online':
        return { bg: '#ecfdf5', fg: '#047857', dot: '#10b981' };
      case 'offline':
        return { bg: '#fef2f2', fg: '#b91c1c', dot: '#ef4444' };
      default:
        return { bg: '#f1f5f9', fg: '#64748b', dot: '#94a3b8' };
    }
  });
}
