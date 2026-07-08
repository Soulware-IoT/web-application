import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { EdgeDeviceResponse } from '../../../../../../../core/models/edge-device.model';
import { EdgeDeviceService } from '../../../../../../../core/services/edge-device.service';
import { ModalRef } from '../../../../../../../core/modal/modal-ref';

/** Modal form to rename the org's edge device. */
@Component({
  selector: 'app-rename-edge-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslocoPipe],
  template: `
    <form
      [formGroup]="form"
      (ngSubmit)="submit()"
      class="grid gap-4"
      style="min-width: min(24rem, 80vw)"
    >
      <div class="grid gap-1">
        <label for="edge-rename" class="text-xs font-medium" style="color: #4A4A4F">
          {{ 'security.edge.rename.name' | transloco }}
        </label>
        <input
          id="edge-rename"
          type="text"
          formControlName="name"
          autocomplete="off"
          [attr.aria-invalid]="showError()"
          class="rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-[#0E3B63]"
          style="border-color: #e2e8f0; color: #1a1a1a"
        />
      </div>

      <div class="grid grid-flow-col justify-end gap-2">
        <button
          type="button"
          (click)="ref.close(false)"
          class="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100"
          style="color: #4A4A4F"
        >
          {{ 'common.cancel' | transloco }}
        </button>
        <button
          type="submit"
          [disabled]="saving()"
          class="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
          style="background: #0E3B63"
        >
          {{ (saving() ? 'security.edge.rename.saving' : 'security.edge.rename.save') | transloco }}
        </button>
      </div>
    </form>
  `,
})
export class RenameEdgeModal {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly edgeService = inject(EdgeDeviceService);

  protected readonly ref = inject(ModalRef) as ModalRef<boolean, EdgeDeviceResponse>;
  protected readonly saving = this.edgeService.saving;

  private readonly device = this.ref.data;

  protected readonly form = this.fb.group({
    name: [this.device?.name ?? '', Validators.required],
  });

  protected showError(): boolean {
    const control = this.form.controls.name;
    return control.invalid && (control.dirty || control.touched);
  }

  protected async submit(): Promise<void> {
    if (!this.device || this.saving()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const ok = await this.edgeService.update(this.device.id, {
      name: this.form.getRawValue().name.trim(),
    });
    if (ok) this.ref.close(true);
  }
}
