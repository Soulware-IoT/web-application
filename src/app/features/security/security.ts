import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { SecurityTabs } from './components/security-tabs/security-tabs';

/** Shell for the security sub-views: header + tabs + routed content. */
@Component({
  selector: 'app-security',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, TranslocoPipe, SecurityTabs],
  template: `
    <div class="grid gap-6 p-4 sm:p-6 lg:p-8" style="align-content: start">
      <header class="grid gap-4">
        <div class="grid gap-1">
          <h1 class="text-3xl font-bold" style="color: #1a1a1a">
            {{ 'security.title' | transloco }}
          </h1>
          <p class="text-sm" style="color: #64748b">{{ 'security.subtitle' | transloco }}</p>
        </div>
        <app-security-tabs />
      </header>

      <router-outlet />
    </div>
  `,
})
export class Security {}
