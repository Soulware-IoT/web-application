import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Loading placeholder mirroring the organization details card. */
@Component({
  selector: 'app-organization-details-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    <section
      class="grid gap-6 rounded-2xl border p-6"
      style="border-color: #e2e8f0; background: #ffffff"
    >
      <div class="grid gap-2">
        <div class="h-5 w-48 animate-pulse rounded" style="background: #e2e8f0"></div>
        <div class="h-3.5 w-64 animate-pulse rounded" style="background: #eef2f6"></div>
      </div>

      <div class="grid items-center gap-4" style="grid-template-columns: auto minmax(0, 1fr)">
        <div class="h-16 w-16 animate-pulse rounded-xl" style="background: #e2e8f0"></div>
        <div class="h-5 w-40 animate-pulse rounded" style="background: #e2e8f0"></div>
      </div>

      <dl class="grid gap-4" style="grid-template-columns: repeat(2, minmax(0, 1fr))">
        @for (row of rows; track $index) {
          <div class="grid gap-1.5">
            <div class="h-3 w-20 animate-pulse rounded" style="background: #eef2f6"></div>
            <div class="h-4 w-32 animate-pulse rounded" style="background: #e2e8f0"></div>
          </div>
        }
      </dl>
    </section>
  `,
})
export class OrganizationDetailsSkeleton {
  protected readonly rows = [0, 1, 2];
}
