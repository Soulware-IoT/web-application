import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ControlProcessResponse } from '../../../../core/models/control-process.model';
import { ControlProcessService } from '../../../../core/services/control-process.service';
import { ModalService } from '../../../../core/modal/modal.service';
import { RenameProcessModal } from '../rename-process-modal/rename-process-modal';

@Component({
  selector: 'app-process-nav-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './process-nav-item.html',
})
export class ProcessNavItem {
  private readonly modal = inject(ModalService);
  private readonly processService = inject(ControlProcessService);

  readonly process = input.required<ControlProcessResponse>();

  protected async edit(): Promise<void> {
    const process = this.process();
    const ref = this.modal.open<string>(RenameProcessModal, {
      title: 'Renombrar proceso',
      data: { id: process.id, name: process.name },
    });

    const newName = await ref.closed;
    if (newName && newName !== process.name) {
      this.processService.rename(process.id, newName);
    }
  }
}
