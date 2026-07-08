import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Loading placeholder mirroring the IoT device card. */
@Component({
  selector: 'app-device-list-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    <section
      class="grid gap-6 rounded-2xl border p-6"
      style="border-color: #e2e8f0; background: #ffffff"
    >
      <div class="grid items-center gap-4" style="grid-template-columns: minmax(0, 1fr) auto">
        <div class="grid gap-2">
          <div class="h-5 w-28 animate-pulse rounded" style="background: #e2e8f0"></div>
          <div class="h-3.5 w-52 animate-pulse rounded" style="background: #eef2f6"></div>
        </div>
        <div class="h-6 w-20 animate-pulse rounded-full" style="background: #e2e8f0"></div>
      </div>

      <ul class="grid gap-3">
        @for (row of rows; track $index) {
          <li
            class="grid items-center gap-4 rounded-xl border p-4"
            style="border-color: #eef2f6; grid-template-columns: minmax(0, 1fr) auto"
          >
            <div class="grid gap-1.5">
              <div class="h-4 w-40 animate-pulse rounded" style="background: #e2e8f0"></div>
              <div class="h-3 w-32 animate-pulse rounded" style="background: #eef2f6"></div>
            </div>
            <div class="h-6 w-20 animate-pulse rounded-full" style="background: #eef2f6"></div>
          </li>
        }
      </ul>
    </section>
  `,
})
export class DeviceListSkeleton {
  protected readonly rows = [0, 1, 2];
}
