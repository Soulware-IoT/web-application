import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { OrganizationService } from '../../core/services/organization.service';
import { OrganizationMemberService } from '../../core/services/organization-member.service';
import { SubscriptionService } from '../../core/services/subscription.service';
import { OrganizationDetails } from './components/organization-details/organization-details';
import { OrganizationMembers } from './components/organization-members/organization-members';
import { OrganizationSubscription } from './components/organization-subscription/organization-subscription';

@Component({
  selector: 'app-organizations',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe, OrganizationDetails, OrganizationMembers, OrganizationSubscription],
  template: `
    <div class="grid gap-8 p-8" style="align-content: start">
      <header class="grid gap-1">
        <h1 class="text-3xl font-bold" style="color: #1a1a1a">
          {{ 'organizations.title' | transloco }}
        </h1>
        <p class="text-sm" style="color: #64748b">{{ 'organizations.subtitle' | transloco }}</p>
      </header>

      @if (organization(); as org) {
        <div class="grid gap-6" style="grid-template-columns: minmax(0, 2fr) minmax(0, 1fr)">
          <app-organization-details [organization]="org" />
          @if (subscription(); as sub) {
            <app-organization-subscription [subscription]="sub" />
          }
        </div>

        <app-organization-members [members]="members()" />
      } @else if (loading()) {
        <p class="text-sm" style="color: #64748b">{{ 'organizations.loading' | transloco }}</p>
      } @else {
        <p class="text-sm" style="color: #64748b">{{ 'organizations.none' | transloco }}</p>
      }
    </div>
  `,
})
export class Organizations {
  private readonly organizationService = inject(OrganizationService);
  private readonly memberService = inject(OrganizationMemberService);
  private readonly subscriptionService = inject(SubscriptionService);

  protected readonly organization = this.organizationService.activeOrg;
  protected readonly loading = this.organizationService.loading;
  protected readonly members = this.memberService.members;
  protected readonly subscription = this.subscriptionService.subscription;
}
