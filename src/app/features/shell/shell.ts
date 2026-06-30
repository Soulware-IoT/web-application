import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidenav } from './sidenav/sidenav';

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Sidenav],
  template: `
    <div class="grid min-h-dvh md:grid-cols-[260px_1fr]">
      <app-sidenav />
      <main>
        <router-outlet />
      </main>
    </div>
  `,
})
export class Shell {}
