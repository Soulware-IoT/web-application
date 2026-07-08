import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ControlProcessService } from '../../../core/services/control-process.service';
import { ProcessNavItem } from './process-nav-item/process-nav-item';

@Component({
  selector: 'app-process-sidenav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe, ProcessNavItem],
  templateUrl: './process-sidenav.html',
})
export class ProcessSidenav {
  private readonly processService = inject(ControlProcessService);

  protected readonly processes = this.processService.processes;
  protected readonly loading = this.processService.loading;

  protected readonly isEmpty = computed(
    () => !this.loading() && (this.processes()?.length ?? 0) === 0,
  );
}
