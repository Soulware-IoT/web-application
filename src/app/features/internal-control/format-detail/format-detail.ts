import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { ControlFormatService } from '../../../core/services/control-format.service';
import { FormatStatusMenu } from '../components/format-status-menu/format-status-menu';

@Component({
  selector: 'app-format-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormatStatusMenu],
  template: `
    @if (format(); as f) {
      <div class="grid h-full gap-6 p-8" style="grid-template-rows: auto 1fr">
        <!-- Header: big name (marquee-truncated) + status label -->
        <header class="grid gap-2">
          <div class="grid items-center gap-4" style="grid-template-columns: minmax(0, 1fr) auto">
            <h1
              class="marquee text-3xl font-bold leading-tight md:text-4xl"
              style="color: #1a1a1a"
            >
              <span class="marquee-inner">{{ f.name }}</span>
            </h1>
            <app-format-status-menu [format]="f" />
          </div>
        </header>

        <!-- Registries area (coming soon) -->
        <section
          class="grid place-items-center rounded-lg border border-dashed"
          style="border-color: #e2e8f0"
        >
          <p class="text-sm" style="color: #94a3b8">
            Aquí se cargarán los registros del formato — próximamente.
          </p>
        </section>
      </div>
    }
  `,
})
export class FormatDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly formatService = inject(ControlFormatService);

  private readonly formatId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('formatId'))),
    { initialValue: null },
  );

  protected readonly format = this.formatService.format;

  constructor() {
    effect(() => {
      const id = this.formatId();
      if (id) this.formatService.loadDetail(id);
    });
  }
}
