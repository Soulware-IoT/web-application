import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { EdgeDeviceService } from '../../../../../../../core/services/edge-device.service';

/** Code + name inputs that register the org's single edge device. */
@Component({
  selector: 'app-edge-claim-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslocoPipe],
  template: `
    <form
      [formGroup]="form"
      (ngSubmit)="submit()"
      class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
    >
      <div class="grid gap-1">
        <label for="edge-code" class="sr-only">{{ 'security.edge.register.code' | transloco }}</label>
        <input
          id="edge-code"
          type="text"
          formControlName="code"
          autocomplete="off"
          [attr.aria-invalid]="showError('code')"
          [placeholder]="'security.edge.register.code_placeholder' | transloco"
          class="rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-[#0E3B63]"
          style="border-color: #e2e8f0; color: #1a1a1a"
        />
      </div>
      <div class="grid gap-1">
        <label for="edge-name" class="sr-only">{{ 'security.edge.register.name' | transloco }}</label>
        <input
          id="edge-name"
          type="text"
          formControlName="name"
          autocomplete="off"
          [attr.aria-invalid]="showError('name')"
          [placeholder]="'security.edge.register.name_placeholder' | transloco"
          class="rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-[#0E3B63]"
          style="border-color: #e2e8f0; color: #1a1a1a"
        />
      </div>
      <button
        type="submit"
        [disabled]="saving()"
        class="h-fit self-start rounded-lg bg-white px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
        style="color: #0E3B63"
      >
        {{
          (saving() ? 'security.edge.register.registering' : 'security.edge.register.submit')
            | transloco
        }}
      </button>
    </form>
  `,
})
export class EdgeClaimForm {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly edgeService = inject(EdgeDeviceService);

  protected readonly saving = this.edgeService.saving;

  protected readonly form = this.fb.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
  });

  protected showError(field: 'code' | 'name'): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.dirty || control.touched);
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    const { code, name } = this.form.getRawValue();
    await this.edgeService.claim({ code: code.trim(), name: name.trim() });
  }
}
