import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import {
  ControlFormatResponse,
  LIFECYCLE_ACTIONS,
  LifecycleAction,
  STATUS_COLOR,
} from '../../../../../core/models/control-format.model';
import { ControlFormatService } from '../../../../../core/services/control-format.service';
import { PermissionService } from '../../../../../core/services/permission.service';
import { ModalService } from '../../../../../core/modal/modal.service';
import { ConfirmModal, ConfirmData } from '../../../../../core/modal/confirm-modal/confirm-modal';

@Component({
  selector: 'app-format-status-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe],
  templateUrl: './format-status-menu.html',
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'close()',
  },
})
export class FormatStatusMenu {
  private readonly host = inject(ElementRef);
  private readonly transloco = inject(TranslocoService);
  private readonly formatService = inject(ControlFormatService);
  private readonly permissions = inject(PermissionService);
  private readonly modal = inject(ModalService);

  readonly format = input.required<ControlFormatResponse>();

  protected readonly open = signal(false);
  protected readonly actions = computed(() => LIFECYCLE_ACTIONS[this.format().status]);
  /** Lifecycle transitions are admin-only; non-admins see a static status pill. */
  protected readonly hasActions = computed(
    () => this.permissions.has('internalControl', 'admin') && this.actions().length > 0,
  );
  protected readonly statusColor = computed(() => STATUS_COLOR[this.format().status]);

  protected toggle(): void {
    if (this.hasActions()) this.open.update((v) => !v);
  }

  protected close(): void {
    this.open.set(false);
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) this.close();
  }

  protected async run(action: LifecycleAction): Promise<void> {
    this.close();
    const format = this.format();

    if (action.destructive) {
      const data: ConfirmData = {
        message: this.transloco.translate('internalControl.lifecycle.cease_confirm', {
          name: format.name,
        }),
        confirmLabel: this.transloco.translate('internalControl.lifecycle.cease'),
        destructive: true,
      };
      const confirmed = await this.modal.open<boolean, ConfirmData>(ConfirmModal, {
        title: this.transloco.translate('internalControl.lifecycle.cease_title'),
        data,
      }).closed;
      if (!confirmed) return;
    }

    await this.formatService.transition(format.id, action.action);
  }
}
