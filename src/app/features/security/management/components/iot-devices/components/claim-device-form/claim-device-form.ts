import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { isUnlimited } from '../../../../../../../core/models/iot-device.model';
import { IoTDeviceService } from '../../../../../../../core/services/iot-device.service';

/**
 * Code + name inputs that claim a provisioned IoT device for the active org.
 * Disabled with a hint once the plan quota is used up.
 */
@Component({
  selector: 'app-claim-device-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslocoPipe],
  template: `
    <form
      [formGroup]="form"
      (ngSubmit)="submit()"
      class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
    >
      <div class="grid gap-1">
        <label for="claim-code" class="sr-only">{{ 'security.iot.claim.code' | transloco }}</label>
        <input
          id="claim-code"
          type="text"
          formControlName="code"
          autocomplete="off"
          [attr.aria-invalid]="showError('code')"
          [placeholder]="'security.iot.claim.code_placeholder' | transloco"
          class="rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-[#0E3B63] disabled:opacity-50"
          style="border-color: #e2e8f0; color: #1a1a1a"
        />
      </div>
      <div class="grid gap-1">
        <label for="claim-name" class="sr-only">{{ 'security.iot.claim.name' | transloco }}</label>
        <input
          id="claim-name"
          type="text"
          formControlName="name"
          autocomplete="off"
          [attr.aria-invalid]="showError('name')"
          [placeholder]="'security.iot.claim.name_placeholder' | transloco"
          class="rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-[#0E3B63] disabled:opacity-50"
          style="border-color: #e2e8f0; color: #1a1a1a"
        />
      </div>
      <button
        type="submit"
        [disabled]="claiming() || quotaFull()"
        class="h-fit self-start rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
        style="background: #0E3B63"
      >
        {{ (claiming() ? 'security.iot.claim.claiming' : 'security.iot.claim.submit') | transloco }}
      </button>

      @if (quotaFull()) {
        <p class="text-xs sm:col-span-3" style="color: #b45309">
          {{ 'security.iot.claim.quota_full' | transloco }}
        </p>
      }
    </form>
  `,
})
export class ClaimDeviceForm {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly devices = inject(IoTDeviceService);

  protected readonly claiming = this.devices.claiming;

  protected readonly quotaFull = computed(() => {
    const quota = this.devices.quota();
    return !!quota && !isUnlimited(quota) && quota.used >= quota.limit;
  });

  protected readonly form = this.fb.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
  });

  protected showError(field: 'code' | 'name'): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.dirty || control.touched);
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid || this.claiming() || this.quotaFull()) {
      this.form.markAllAsTouched();
      return;
    }
    const { code, name } = this.form.getRawValue();
    const ok = await this.devices.claim({ code: code.trim(), name: name.trim() });
    if (ok) this.form.reset();
  }
}
