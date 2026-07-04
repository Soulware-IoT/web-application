import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalRef } from '../../../../../../core/modal/modal-ref';

interface RenameProcessData {
  id: string;
  name: string;
}

@Component({
  selector: 'app-rename-process-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <form class="grid gap-4" [formGroup]="form" (ngSubmit)="save()">
      <div class="grid gap-1.5">
        <label for="process-name" class="text-sm font-medium" style="color: #1a1a1a">
          Nombre del proceso
        </label>
        <input
          id="process-name"
          type="text"
          formControlName="name"
          class="rounded-[3px] border px-3 py-2 text-sm outline-none focus:border-[#0E3B63]"
          style="border-color: #e2e8f0; color: #1a1a1a"
        />
      </div>

      <div class="grid grid-flow-col justify-end gap-2">
        <button
          type="button"
          (click)="ref.close()"
          class="rounded-[3px] px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100"
          style="color: #4A4A4F"
        >
          Cancelar
        </button>
        <button
          type="submit"
          [disabled]="form.invalid"
          class="rounded-[3px] px-3 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
          style="background-color: #0E3B63"
        >
          Guardar
        </button>
      </div>
    </form>
  `,
})
export class RenameProcessModal {
  protected readonly ref = inject(ModalRef) as ModalRef<string, RenameProcessData>;

  protected readonly form = new FormGroup({
    name: new FormControl(this.ref.data?.name ?? '', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected save(): void {
    const value = this.form.controls.name.value.trim();
    if (!value) return;
    this.ref.close(value);
  }
}
