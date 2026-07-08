import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { OrganizationService } from '../../../core/services/organization.service';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { OrganizationDetails } from './components/organization-details/organization-details';
import { OrganizationDetailsSkeleton } from './components/organization-details-skeleton/organization-details-skeleton';
import { OrganizationSubscription } from './components/organization-subscription/organization-subscription';
import { OrganizationSubscriptionSkeleton } from './components/organization-subscription-skeleton/organization-subscription-skeleton';

/** Overview tab: organization details and subscription. */
@Component({
  selector: 'app-organization-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslocoPipe,
    OrganizationDetails,
    OrganizationDetailsSkeleton,
    OrganizationSubscription,
    OrganizationSubscriptionSkeleton,
  ],
  template: `
    @if (loading() || organization()) {
      <div class="grid gap-6" role="status" [attr.aria-busy]="loading() || subLoading()">
        @if (loading() || subLoading()) {
          <span class="sr-only">{{ 'organizations.loading' | transloco }}</span>
        }
        <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <!-- Details cell -->
          @if (organization(); as org) {
            <app-organization-details [organization]="org" />
          } @else {
            <app-organization-details-skeleton />
          }

          <!-- Subscription cell (independent loading) -->
          @if (subscription(); as sub) {
            <app-organization-subscription [subscription]="sub" />
          } @else if (subLoading() || loading()) {
            <app-organization-subscription-skeleton />
          }
        </div>
      </div>
    } @else {
      <p class="text-sm" style="color: #64748b">{{ 'organizations.none' | transloco }}</p>
    }
  `,
})
export class Overview {
  private readonly organizationService = inject(OrganizationService);
  private readonly subscriptionService = inject(SubscriptionService);

  protected readonly organization = this.organizationService.activeOrg;
  protected readonly loading = this.organizationService.loading;
  protected readonly subscription = this.subscriptionService.subscription;
  protected readonly subLoading = this.subscriptionService.loading;
}
