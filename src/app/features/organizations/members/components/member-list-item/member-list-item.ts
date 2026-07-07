import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import {
  OrganizationMemberResponse,
  PERMISSION_RANK,
  PermissionLevel,
} from '../../../../../core/models/organization-member.model';

/** A single member row; links to the member's permission panel. */
@Component({
  selector: 'app-member-list-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, TranslocoPipe],
  template: `
    <a
      [routerLink]="[member().id]"
      routerLinkActive
      #active="routerLinkActive"
      class="grid items-center gap-4 rounded-xl border p-4 transition-colors"
      style="grid-template-columns: auto minmax(0, 1fr) auto"
      [style.border-color]="active.isActive ? '#0E3B63' : '#eef2f6'"
      [style.background]="active.isActive ? '#eef4fb' : '#ffffff'"
    >
      <div
        class="grid h-10 w-10 place-items-center rounded-full text-sm font-semibold"
        style="background: #eef4fb; color: #0E3B63"
      >
        {{ initial() }}
      </div>
      <div class="grid gap-0.5">
        <p class="truncate text-sm font-medium" style="color: #1a1a1a">
          {{ name() || ('organizations.members.no_name' | transloco) }}
        </p>
        <p class="truncate text-xs" style="color: #64748b">{{ member().profile.email || '—' }}</p>
      </div>
      <span
        class="rounded-full px-3 py-1 text-xs font-medium"
        style="background: #f1f5f9; color: #475569"
      >
        {{ 'organizations.members.roles.' + topRole() | transloco }}
      </span>
    </a>
  `,
})
export class MemberListItem {
  readonly member = input.required<OrganizationMemberResponse>();

  protected readonly name = computed(() => {
    const p = this.member().profile;
    return p.preferredName || p.fullName || '';
  });

  protected readonly initial = computed(() => (this.name() || '?').charAt(0).toUpperCase());

  /** Highest level across contexts — drives the summary badge. */
  protected readonly topRole = computed<PermissionLevel>(() => {
    const levels = Object.values(this.member().permissions) as PermissionLevel[];
    return levels.reduce<PermissionLevel>(
      (best, level) => (PERMISSION_RANK[level] > PERMISSION_RANK[best] ? level : best),
      'none',
    );
  });
}
