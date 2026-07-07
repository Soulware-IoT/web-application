import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Loading placeholder mirroring the subscription card. */
@Component({
  selector: 'app-organization-subscription-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    <section
      class="grid gap-6 rounded-2xl border p-6"
      style="border-color: #e2e8f0; background: #ffffff"
    >
      <div class="grid gap-2">
        <div class="h-5 w-32 animate-pulse rounded" style="background: #e2e8f0"></div>
        <div class="h-3.5 w-48 animate-pulse rounded" style="background: #eef2f6"></div>
      </div>

      <div class="h-24 animate-pulse rounded-xl" style="background: #e2e8f0"></div>

      <div class="grid gap-1.5">
        <div class="h-3 w-16 animate-pulse rounded" style="background: #eef2f6"></div>
        <div class="h-4 w-28 animate-pulse rounded" style="background: #e2e8f0"></div>
      </div>

      <div class="h-9 w-full animate-pulse rounded-lg" style="background: #eef2f6"></div>
    </section>
  `,
})
export class OrganizationSubscriptionSkeleton {}
