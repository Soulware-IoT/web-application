import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { ControlProcessService } from '../../../core/services/control-process.service';

@Component({
  selector: 'app-process-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-8">
      <h1 class="text-lg font-semibold" style="color: #1a1a1a">{{ processName() }}</h1>
      <p class="mt-1 text-sm" style="color: #4A4A4F">
        Detalle del proceso — próximamente.
      </p>
    </div>
  `,
})
export class ProcessDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly processService = inject(ControlProcessService);

  private readonly processId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('processId'))),
    { initialValue: null },
  );

  protected readonly processName = computed(() => {
    const id = this.processId();
    const match = this.processService.processes()?.find((p) => p.id === id);
    return match?.name ?? 'Proceso';
  });
}
