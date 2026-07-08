import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { ModalRef } from '../../../../../../core/modal/modal-ref';

export interface CreateFormatResult {
  name: string;
  createSampleFields: boolean;
}

@Component({
  selector: 'app-create-format-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslocoPipe],
  template: `
    <form class="grid gap-4" [formGroup]="form" (ngSubmit)="save()">
      <div class="grid gap-1.5">
        <label for="format-name" class="text-sm font-medium" style="color: #1a1a1a">
          {{ 'internalControl.form.format_name' | transloco }}
        </label>
        <input
          id="format-name"
          type="text"
          formControlName="name"
          class="rounded-[3px] border px-3 py-2 text-sm outline-none focus:border-[#0E3B63]"
          style="border-color: #e2e8f0; color: #1a1a1a"
        />
      </div>

      <label class="flex items-center gap-2 text-sm" style="color: #4A4A4F">
        <input type="checkbox" formControlName="createSampleFields" />
        {{ 'internalControl.form.sample_fields' | transloco }}
      </label>

      <div class="grid grid-flow-col justify-end gap-2">
        <button
          type="button"
          (click)="ref.close()"
          class="rounded-[3px] px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100"
          style="color: #4A4A4F"
        >
          {{ 'internalControl.form.cancel' | transloco }}
        </button>
        <button
          type="submit"
          [disabled]="form.invalid"
          class="rounded-[3px] px-3 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
          style="background-color: #0E3B63"
        >
          {{ 'internalControl.form.create' | transloco }}
        </button>
      </div>
    </form>
  `,
})
export class CreateFormatModal {
  protected readonly ref = inject(ModalRef) as ModalRef<CreateFormatResult>;

  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    createSampleFields: new FormControl(false, { nonNullable: true }),
  });

  protected save(): void {
    const name = this.form.controls.name.value.trim();
    if (!name) return;
    this.ref.close({ name, createSampleFields: this.form.controls.createSampleFields.value });
  }
}
