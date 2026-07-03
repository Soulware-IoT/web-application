import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ModalRef } from '../modal-ref';

export interface ConfirmData {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Styles the confirm button as a destructive action. */
  destructive?: boolean;
}

/** Generic yes/no dialog. Resolves the ModalRef with `true` when confirmed. */
@Component({
  selector: 'app-confirm-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid gap-4">
      <p class="text-sm" style="color: #4A4A4F">{{ data?.message }}</p>

      <div class="grid grid-flow-col justify-end gap-2">
        <button
          type="button"
          (click)="ref.close(false)"
          class="rounded-[3px] px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100"
          style="color: #4A4A4F"
        >
          {{ data?.cancelLabel ?? 'Cancelar' }}
        </button>
        <button
          type="button"
          (click)="ref.close(true)"
          class="rounded-[3px] px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          [style.background-color]="data?.destructive ? '#dc2626' : '#0E3B63'"
        >
          {{ data?.confirmLabel ?? 'Confirmar' }}
        </button>
      </div>
    </div>
  `,
})
export class ConfirmModal {
  protected readonly ref = inject(ModalRef) as ModalRef<boolean, ConfirmData>;
  protected readonly data = this.ref.data;
}
