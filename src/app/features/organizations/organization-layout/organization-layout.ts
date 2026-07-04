import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { OrganizationService } from '../../../core/services/organization.service';
import { OrganizationTabs } from './components/organization-tabs/organization-tabs';

/** Shell for the organization sub-views: header + tabs + routed content. */
@Component({
  selector: 'app-organization-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, TranslocoPipe, OrganizationTabs],
  template: `
    <div class="grid gap-6 p-8" style="align-content: start">
      <header class="grid gap-4">
        <div class="grid gap-1">
          <h1 class="text-3xl font-bold" style="color: #1a1a1a">
            {{ 'organizations.title' | transloco }}
          </h1>
          @if (orgName(); as name) {
            <p class="truncate text-sm" style="color: #64748b">{{ name }}</p>
          } @else {
            <div class="h-4 w-40 animate-pulse rounded" style="background: #eef2f6"></div>
          }
        </div>
        <app-organization-tabs />
      </header>

      <router-outlet />
    </div>
  `,
})
export class OrganizationLayout {
  private readonly organizationService = inject(OrganizationService);

  protected readonly orgName = computed(() => this.organizationService.activeOrg()?.name ?? '');
}
