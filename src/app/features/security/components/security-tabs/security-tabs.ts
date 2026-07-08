import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

/** Secondary nav for the security sub-views. */
@Component({
  selector: 'app-security-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, TranslocoPipe],
  template: `
    <nav
      class="flex gap-1 border-b"
      style="border-color: #e2e8f0"
      [attr.aria-label]="'security.title' | transloco"
    >
      @for (tab of tabs; track tab.path) {
        <a
          [routerLink]="tab.path"
          routerLinkActive
          #active="routerLinkActive"
          class="relative px-3 py-2 text-sm font-medium transition-colors"
          [style.color]="active.isActive ? '#0E3B63' : '#64748b'"
        >
          {{ tab.labelKey | transloco }}
          @if (active.isActive) {
            <span
              class="absolute inset-x-0 -bottom-px h-0.5 rounded-full"
              style="background: #0E3B63"
              aria-hidden="true"
            ></span>
          }
        </a>
      }
    </nav>
  `,
})
export class SecurityTabs {
  protected readonly tabs = [
    { path: 'management', labelKey: 'security.tabs.management' },
    { path: 'readings', labelKey: 'security.tabs.readings' },
  ];
}
