import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Loading placeholder that mirrors the format detail layout (header + editor). */
@Component({
  selector: 'app-format-detail-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'status', 'aria-busy': 'true' },
  template: `
    <span class="sr-only">Cargando formato…</span>

    <div class="grid h-full gap-6 p-8" style="grid-template-rows: auto 1fr" aria-hidden="true">
      <!-- Header: name + status pill -->
      <header class="grid items-center gap-4" style="grid-template-columns: minmax(0, 1fr) auto">
        <div class="h-9 w-2/3 animate-pulse rounded-md" style="background: #e2e8f0"></div>
        <div class="h-7 w-28 animate-pulse rounded-full" style="background: #e2e8f0"></div>
      </header>

      <!-- Content card -->
      <section
        class="grid content-start gap-4 rounded-lg border bg-white p-5"
        style="border-color: #e2e8f0"
      >
        <div class="grid items-center gap-3" style="grid-template-columns: 1fr auto">
          <div class="grid gap-1.5">
            <div class="h-4 w-40 animate-pulse rounded" style="background: #e2e8f0"></div>
            <div class="h-3 w-64 animate-pulse rounded" style="background: #eef2f6"></div>
          </div>
          <div class="h-8 w-32 animate-pulse rounded-[3px]" style="background: #e2e8f0"></div>
        </div>

        @for (row of rows; track $index) {
          <div
            class="h-12 animate-pulse rounded-md border"
            style="border-color: #e2e8f0; background: #f8fafc"
          ></div>
        }
      </section>
    </div>
  `,
})
export class FormatDetailSkeleton {
  protected readonly rows = [0, 1, 2, 3];
}
