import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { ControlProcessService } from '../../../core/services/control-process.service';
import { PermissionService } from '../../../core/services/permission.service';
import { ModalService } from '../../../core/modal/modal.service';
import { ProcessNavItem } from './process-nav-item/process-nav-item';
import { CreateProcessModal } from './components/create-process-modal/create-process-modal';

@Component({
  selector: 'app-process-sidenav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe, ProcessNavItem],
  templateUrl: './process-sidenav.html',
})
export class ProcessSidenav {
  private readonly processService = inject(ControlProcessService);
  private readonly permissions = inject(PermissionService);
  private readonly modal = inject(ModalService);
  private readonly transloco = inject(TranslocoService);

  protected readonly processes = this.processService.processes;
  protected readonly loading = this.processService.loading;

  /** Creating processes requires context admin. */
  protected readonly canManage = computed(() => this.permissions.has('internalControl', 'admin'));

  protected readonly isEmpty = computed(
    () => !this.loading() && (this.processes()?.length ?? 0) === 0,
  );

  protected async createProcess(): Promise<void> {
    const ref = this.modal.open<string>(CreateProcessModal, {
      title: this.transloco.translate('internalControl.form.new_process_title'),
    });

    const name = await ref.closed;
    if (name) {
      this.processService.create(name);
    }
  }
}
