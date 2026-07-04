import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { OrganizationMemberService } from '../../../core/services/organization-member.service';
import { PermissionService } from '../../../core/services/permission.service';
import { OrganizationMembersSkeleton } from './components/organization-members-skeleton/organization-members-skeleton';
import { MemberListItem } from './components/member-list-item/member-list-item';

/** Members tab: member list (master) + permission panel (detail outlet). */
@Component({
  selector: 'app-organization-members-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, TranslocoPipe, OrganizationMembersSkeleton, MemberListItem],
  // The outlet renders the routed panel as its next sibling; hiding the outlet
  // element itself keeps the grid to two items (list + panel).
  styles: ':host { display: block } router-outlet { display: none }',
  template: `
    @if (!canView()) {
      <p class="text-sm" style="color: #64748b">
        {{ 'organizations.members.view_denied' | transloco }}
      </p>
    } @else if (loading()) {
      <app-organization-members-skeleton />
    } @else {
      <div class="grid gap-6" style="grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr)">
        <section
          class="grid content-start gap-6 rounded-2xl border p-6"
          style="border-color: #e2e8f0; background: #ffffff"
        >
          <header class="grid items-center gap-4" style="grid-template-columns: minmax(0, 1fr) auto">
            <div class="grid gap-1">
              <h2 class="text-lg font-semibold" style="color: #1a1a1a">
                {{ 'organizations.members.title' | transloco }}
              </h2>
              <p class="text-sm" style="color: #64748b">
                {{ 'organizations.members.count' | transloco: { count: members().length } }}
              </p>
            </div>
          </header>

          <ul class="grid gap-3">
            @for (member of members(); track member.id) {
              <li><app-member-list-item [member]="member" /></li>
            }
          </ul>
        </section>

        <router-outlet />
      </div>
    }
  `,
})
export class Members {
  private readonly memberService = inject(OrganizationMemberService);
  private readonly permissions = inject(PermissionService);

  protected readonly members = this.memberService.members;
  protected readonly loading = this.memberService.loading;

  /** Reading the roster requires at least lieutenant in the organizations context. */
  protected readonly canView = computed(() => this.permissions.has('organizations', 'lieutenant'));
}
