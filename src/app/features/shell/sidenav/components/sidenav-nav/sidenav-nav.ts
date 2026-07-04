import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PermissionService } from '../../../../../core/services/permission.service';
import { PermissionContext, PermissionLevel } from '../../../../../core/models/organization-member.model';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  /** Context whose permission gates this entry's visibility. */
  context: PermissionContext;
  /** Minimum level needed to even see the section exists. */
  minLevel: PermissionLevel;
}

@Component({
  selector: 'app-sidenav-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidenav-nav.html',
})
export class SidenavNav {
  private readonly permissions = inject(PermissionService);

  private readonly items: NavItem[] = [
    {
      label: 'Organization',
      route: '/app/organizations',
      context: 'organizations',
      minLevel: 'none',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
    },
    {
      label: 'Internal Control',
      route: '/app/internal-control',
      context: 'internalControl',
      minLevel: 'assignee',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
    },
    {
      label: 'Security',
      route: '/app/security',
      context: 'security',
      minLevel: 'assignee',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    },
  ];

  /** Only the sections the caller may access, per the active org's permissions. */
  protected readonly visibleItems = computed(() =>
    this.items.filter((item) => this.permissions.has(item.context, item.minLevel)),
  );
}
