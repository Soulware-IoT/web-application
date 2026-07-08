import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { IoTDeviceResponse } from '../../../../../../../core/models/iot-device.model';
import { IoTDeviceService } from '../../../../../../../core/services/iot-device.service';
import { ModalRef } from '../../../../../../../core/modal/modal-ref';

/** Group validator: the warn threshold must sit below the crit one. */
function warnBelowCrit(warnKey: string, critKey: string, errorKey: string) {
  return (group: AbstractControl): ValidationErrors | null => {
    const warn = group.get(warnKey)?.value;
    const crit = group.get(critKey)?.value;
    if (warn === null || crit === null) return null;
    return Number(warn) >= Number(crit) ? { [errorKey]: true } : null;
  };
}

/**
 * Modal form to rename an IoT device and calibrate its alarm thresholds.
 * The backend requires all four limits whenever thresholds are sent.
 */
@Component({
  selector: 'app-edit-device-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslocoPipe],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="grid gap-4" style="min-width: min(24rem, 80vw)">
      <div class="grid gap-1">
        <label for="edit-device-name" class="text-xs font-medium" style="color: #4A4A4F">
          {{ 'security.iot.edit.name' | transloco }}
        </label>
        <input
          id="edit-device-name"
          type="text"
          formControlName="name"
          autocomplete="off"
          [attr.aria-invalid]="invalid('name')"
          class="rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-[#0E3B63]"
          style="border-color: #e2e8f0; color: #1a1a1a"
        />
      </div>

      <fieldset class="grid gap-2 rounded-xl border p-3" style="border-color: #eef2f6">
        <legend class="px-1 text-xs font-medium" style="color: #4A4A4F">
          {{ 'security.iot.edit.temperature' | transloco }}
        </legend>
        <div class="grid gap-2 sm:grid-cols-2">
          <div class="grid gap-1">
            <label for="edit-temp-warn" class="text-xs" style="color: #64748b">
              {{ 'security.iot.edit.warn' | transloco }}
            </label>
            <input
              id="edit-temp-warn"
              type="number"
              formControlName="tempWarn"
              [attr.aria-invalid]="invalid('tempWarn') || form.hasError('tempOrder')"
              class="rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-[#0E3B63]"
              style="border-color: #e2e8f0; color: #1a1a1a"
            />
          </div>
          <div class="grid gap-1">
            <label for="edit-temp-crit" class="text-xs" style="color: #64748b">
              {{ 'security.iot.edit.crit' | transloco }}
            </label>
            <input
              id="edit-temp-crit"
              type="number"
              formControlName="tempCrit"
              [attr.aria-invalid]="invalid('tempCrit') || form.hasError('tempOrder')"
              class="rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-[#0E3B63]"
              style="border-color: #e2e8f0; color: #1a1a1a"
            />
          </div>
        </div>
        @if (form.hasError('tempOrder')) {
          <p class="text-xs" style="color: #dc2626">
            {{ 'security.iot.edit.order_error' | transloco }}
          </p>
        }
      </fieldset>

      <fieldset class="grid gap-2 rounded-xl border p-3" style="border-color: #eef2f6">
        <legend class="px-1 text-xs font-medium" style="color: #4A4A4F">
          {{ 'security.iot.edit.gas' | transloco }}
        </legend>
        <div class="grid gap-2 sm:grid-cols-2">
          <div class="grid gap-1">
            <label for="edit-gas-warn" class="text-xs" style="color: #64748b">
              {{ 'security.iot.edit.warn' | transloco }}
            </label>
            <input
              id="edit-gas-warn"
              type="number"
              formControlName="gasWarn"
              [attr.aria-invalid]="invalid('gasWarn') || form.hasError('gasOrder')"
              class="rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-[#0E3B63]"
              style="border-color: #e2e8f0; color: #1a1a1a"
            />
          </div>
          <div class="grid gap-1">
            <label for="edit-gas-crit" class="text-xs" style="color: #64748b">
              {{ 'security.iot.edit.crit' | transloco }}
            </label>
            <input
              id="edit-gas-crit"
              type="number"
              formControlName="gasCrit"
              [attr.aria-invalid]="invalid('gasCrit') || form.hasError('gasOrder')"
              class="rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-[#0E3B63]"
              style="border-color: #e2e8f0; color: #1a1a1a"
            />
          </div>
        </div>
        @if (form.hasError('gasOrder')) {
          <p class="text-xs" style="color: #dc2626">
            {{ 'security.iot.edit.order_error' | transloco }}
          </p>
        }
      </fieldset>

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
          {{ (saving() ? 'security.iot.edit.saving' : 'security.iot.edit.save') | transloco }}
        </button>
      </div>
    </form>
  `,
})
export class EditDeviceModal {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly devices = inject(IoTDeviceService);

  protected readonly ref = inject(ModalRef) as ModalRef<boolean, IoTDeviceResponse>;
  protected readonly saving = computed(() => this.devices.updatingId() !== null);

  private readonly device = this.ref.data;

  protected readonly form = this.fb.group(
    {
      name: [this.device?.name ?? '', Validators.required],
      tempWarn: this.fb.control<number | null>(
        this.device?.thresholds?.temperature?.warn ?? null,
        Validators.required,
      ),
      tempCrit: this.fb.control<number | null>(
        this.device?.thresholds?.temperature?.crit ?? null,
        Validators.required,
      ),
      gasWarn: this.fb.control<number | null>(
        this.device?.thresholds?.gas?.warn ?? null,
        Validators.required,
      ),
      gasCrit: this.fb.control<number | null>(
        this.device?.thresholds?.gas?.crit ?? null,
        Validators.required,
      ),
    },
    {
      validators: [
        warnBelowCrit('tempWarn', 'tempCrit', 'tempOrder'),
        warnBelowCrit('gasWarn', 'gasCrit', 'gasOrder'),
      ],
    },
  );

  protected invalid(field: 'name' | 'tempWarn' | 'tempCrit' | 'gasWarn' | 'gasCrit'): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.dirty || control.touched);
  }

  protected async submit(): Promise<void> {
    if (!this.device || this.saving()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, tempWarn, tempCrit, gasWarn, gasCrit } = this.form.getRawValue();
    const ok = await this.devices.update(this.device.id, {
      name: name.trim(),
      thresholds: {
        temperature: { warn: Number(tempWarn), crit: Number(tempCrit) },
        gas: { warn: Number(gasWarn), crit: Number(gasCrit) },
      },
    });
    if (ok) this.ref.close(true);
  }
}
