import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { ModalRef } from '../../../../../../core/modal/modal-ref';
import {
  OrganizationResponse,
} from '../../../../../../core/models/organization.model';
import { OrganizationService, UpdateOrganizationRequest } from '../../../../../../core/services/organization.service';
import {
  NotificationService,
  httpErrorMessage,
} from '../../../../../../core/notifications/notification.service';

@Component({
  selector: 'app-edit-organization-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslocoPipe],
  template: `
    <form class="grid gap-4" [formGroup]="form" (ngSubmit)="save()">
      <div class="grid gap-1.5">
        <label for="org-name" class="text-sm font-medium" style="color: #1a1a1a">
          {{ 'organizations.details.edit.name' | transloco }}
        </label>
        <input
          id="org-name"
          type="text"
          formControlName="name"
          class="rounded-[3px] border px-3 py-2 text-sm outline-none focus:border-[#0E3B63]"
          style="border-color: #e2e8f0; color: #1a1a1a"
        />
      </div>

      <div class="grid gap-1.5">
        <label for="org-address-line-one" class="text-sm font-medium" style="color: #1a1a1a">
          {{ 'organizations.details.address' | transloco }}
        </label>
        <input
          id="org-address-line-one"
          type="text"
          formControlName="lineOne"
          class="rounded-[3px] border px-3 py-2 text-sm outline-none focus:border-[#0E3B63]"
          style="border-color: #e2e8f0; color: #1a1a1a"
        />
      </div>

      <div class="grid gap-1.5">
        <label for="org-address-line-two" class="text-sm font-medium" style="color: #1a1a1a">
          {{ 'organizations.details.address_line_two' | transloco }}
        </label>
        <input
          id="org-address-line-two"
          type="text"
          formControlName="lineTwo"
          class="rounded-[3px] border px-3 py-2 text-sm outline-none focus:border-[#0E3B63]"
          style="border-color: #e2e8f0; color: #1a1a1a"
        />
      </div>

      <div class="grid gap-1.5">
        <label for="org-address-reference" class="text-sm font-medium" style="color: #1a1a1a">
          {{ 'organizations.details.reference' | transloco }}
        </label>
        <input
          id="org-address-reference"
          type="text"
          formControlName="reference"
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
          {{ 'organizations.details.edit.cancel' | transloco }}
        </button>
        <button
          type="submit"
          [disabled]="form.invalid || saving()"
          class="rounded-[3px] px-3 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
          style="background-color: #0E3B63"
        >
          {{
            (saving() ? 'organizations.details.edit.saving' : 'organizations.details.edit.save')
              | transloco
          }}
        </button>
      </div>
    </form>
  `,
})
export class EditOrganizationModal {
  protected readonly ref = inject(ModalRef) as ModalRef<OrganizationResponse, OrganizationResponse>;
  private readonly organizationService = inject(OrganizationService);
  private readonly notifications = inject(NotificationService);
  private readonly transloco = inject(TranslocoService);

  protected readonly saving = signal(false);

  private readonly organization = this.ref.data as OrganizationResponse;

  protected readonly form = new FormGroup({
    name: new FormControl(this.organization.name, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    lineOne: new FormControl(this.organization.address?.lineOne ?? '', { nonNullable: true }),
    lineTwo: new FormControl(this.organization.address?.lineTwo ?? '', { nonNullable: true }),
    reference: new FormControl(this.organization.address?.reference ?? '', { nonNullable: true }),
  });

  protected save(): void {
    const name = this.form.controls.name.value.trim();
    if (!name) return;

    const request: UpdateOrganizationRequest = {
      name,
      address: {
        lineOne: this.form.controls.lineOne.value.trim() || undefined,
        lineTwo: this.form.controls.lineTwo.value.trim() || undefined,
        reference: this.form.controls.reference.value.trim() || undefined,
      },
    };

    this.saving.set(true);
    this.organizationService.update(this.organization.id, request).subscribe({
      next: (updated) => {
        this.notifications.success(
          this.transloco.translate('organizations.details.edit.saved'),
        );
        this.ref.close(updated);
      },
      error: (err) => {
        this.saving.set(false);
        this.notifications.error(httpErrorMessage(err));
      },
    });
  }
}
