import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ControlProcessResponse } from '../../../../core/models/control-process.model';
import { ControlProcessService } from '../../../../core/services/control-process.service';
import { ControlFormatService } from '../../../../core/services/control-format.service';
import { ModalService } from '../../../../core/modal/modal.service';
import { RenameProcessModal } from '../rename-process-modal/rename-process-modal';
import {
  CreateFormatModal,
  CreateFormatResult,
} from '../create-format-modal/create-format-modal';
import { FormatNavItem } from '../format-nav-item/format-nav-item';

@Component({
  selector: 'app-process-nav-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormatNavItem],
  templateUrl: './process-nav-item.html',
})
export class ProcessNavItem {
  private readonly modal = inject(ModalService);
  private readonly router = inject(Router);
  private readonly processService = inject(ControlProcessService);
  private readonly formatService = inject(ControlFormatService);

  readonly process = input.required<ControlProcessResponse>();

  protected readonly expanded = signal(false);

  protected readonly formats = computed(() => this.formatService.formatsFor(this.process().id));
  protected readonly formatsLoading = computed(() =>
    this.formatService.isLoading(this.process().id),
  );

  protected toggle(): void {
    const open = !this.expanded();
    this.expanded.set(open);
    if (open) this.formatService.loadForProcess(this.process().id);
  }

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

  protected async createFormat(): Promise<void> {
    const processId = this.process().id;
    const ref = this.modal.open<CreateFormatResult>(CreateFormatModal, {
      title: 'Nuevo formato',
    });

    const result = await ref.closed;
    if (!result) return;

    const created = await this.formatService.create(
      processId,
      result.name,
      result.createSampleFields,
    );
    if (created) {
      this.expanded.set(true);
      this.router.navigate(['/app/internal-control/formats', created.id]);
    }
  }
}
