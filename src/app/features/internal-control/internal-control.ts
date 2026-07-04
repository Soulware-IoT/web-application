import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProcessSidenav } from "./process-sidenav/process-sidenav";

@Component({
  selector: 'app-internal-control',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, ProcessSidenav],
  template: `
    <div class="grid h-dvh md:grid-cols-[240px_1fr]">
      <app-process-sidenav />
      <section class="overflow-y-auto">
        <router-outlet />
      </section>
    </div>
  `,
})
export class InternalControl {}
