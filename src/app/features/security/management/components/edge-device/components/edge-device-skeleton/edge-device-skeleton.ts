import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Loading placeholder mirroring the edge device hero card. */
@Component({
  selector: 'app-edge-device-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    <div
      class="grid items-center gap-6 rounded-2xl p-6"
      style="background: linear-gradient(135deg, #0E3B63 0%, #14507f 100%); grid-template-columns: minmax(0, 1fr) auto"
    >
      <div class="grid items-center gap-5" style="grid-template-columns: auto minmax(0, 1fr)">
        <div class="h-16 w-16 animate-pulse rounded-2xl bg-white/10"></div>
        <div class="grid gap-2">
          <div class="h-5 w-44 animate-pulse rounded bg-white/20"></div>
          <div class="h-3.5 w-32 animate-pulse rounded bg-white/10"></div>
        </div>
      </div>

      <div class="grid content-center justify-items-end gap-3">
        <div class="h-6 w-40 animate-pulse rounded-full bg-white/10"></div>
        <div class="h-7 w-36 animate-pulse rounded-lg bg-white/10"></div>
      </div>
    </div>
  `,
})
export class EdgeDeviceSkeleton {}
