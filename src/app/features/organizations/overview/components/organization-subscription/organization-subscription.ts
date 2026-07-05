import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { SubscriptionResponse } from '../../../../../core/models/subscription.model';
import { OrganizationService } from '../../../../../core/services/organization.service';
import { ProfileService } from '../../../../../core/services/profile.service';

@Component({
  selector: 'app-organization-subscription',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, TranslocoPipe],
  template: `
    <section
      class="grid gap-6 rounded-2xl border p-6"
      style="border-color: #e2e8f0; background: #ffffff"
    >
      <header class="grid gap-1">
        <h2 class="text-lg font-semibold" style="color: #1a1a1a">
          {{ 'organizations.subscription.title' | transloco }}
        </h2>
        <p class="text-sm" style="color: #64748b">
          {{ 'organizations.subscription.subtitle' | transloco }}
        </p>
      </header>

      <div
        class="grid gap-4 rounded-xl p-5"
        style="background: #0E3B63; grid-template-columns: minmax(0, 1fr) auto"
      >
        <div class="grid gap-1">
          <p class="text-xs font-medium uppercase tracking-wide" style="color: #9db8d4">
            {{ 'organizations.subscription.plan' | transloco }}
          </p>
          <p class="text-xl font-bold text-white">
            {{ 'organizations.subscription.plans.' + subscription().plan | transloco }}
          </p>
        </div>
        <span
          class="self-start rounded-full px-3 py-1 text-xs font-medium"
          style="background: rgba(255, 255, 255, 0.15); color: #ffffff"
        >
          {{
            'organizations.subscription.status.' +
              (subscription().cancelAtPeriodEnd ? 'canceling' : 'active') | transloco
          }}
        </span>
      </div>

      @if (subscription().currentPeriodEnd; as periodEnd) {
        <dl class="grid gap-1">
          <dt class="text-xs font-medium uppercase tracking-wide" style="color: #94a3b8">
            {{
              (subscription().cancelAtPeriodEnd
                ? 'organizations.subscription.ends'
                : 'organizations.subscription.renews'
              ) | transloco
            }}
          </dt>
          <dd class="text-sm" style="color: #1a1a1a">{{ periodEnd | date: 'mediumDate' }}</dd>
        </dl>
      }

      @if (canManage()) {
        <a
          routerLink="/app/organizations/subscription"
          class="rounded-lg border px-4 py-2 text-center text-sm font-medium transition-colors hover:bg-[#eef4fb]"
          style="border-color: #0E3B63; color: #0E3B63"
        >
          {{ 'organizations.subscription.manage.title' | transloco }}
        </a>
      }
    </section>
  `,
})
export class OrganizationSubscription {
  private readonly profiles = inject(ProfileService);
  private readonly organizations = inject(OrganizationService);

  readonly subscription = input.required<SubscriptionResponse>();

  /** Managing billing is owner-only on the backend, so only show the entry point to the org owner. */
  protected readonly canManage = computed(() => {
    const me = this.profiles.profile()?.id;
    const org = this.organizations.activeOrg();
    const ownerId = org?.ownedBy ?? org?.owner?.id;
    return !!me && !!ownerId && me === ownerId;
  });
}
