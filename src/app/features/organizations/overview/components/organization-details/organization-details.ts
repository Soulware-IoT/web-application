import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { OrganizationResponse } from '../../../../../core/models/organization.model';
import { PermissionService } from '../../../../../core/services/permission.service';
import { ModalService } from '../../../../../core/modal/modal.service';
import { EditOrganizationModal } from './components/edit-organization-modal/edit-organization-modal';

/** Datos generales de la organización: identidad y dirección. */
@Component({
  selector: 'app-organization-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe],
  template: `
    <section
      class="group relative grid gap-6 rounded-2xl border p-6"
      style="border-color: #e2e8f0; background: #ffffff"
    >
      @if (true) {
        <button
          type="button"
          (click)="edit()"
          [attr.aria-label]="'organizations.details.edit.aria' | transloco"
          class="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-[3px] opacity-0 transition-opacity hover:bg-black/5 focus-visible:opacity-100 group-hover:opacity-100"
          style="color: #4A4A4F"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
        </button>
      }

      <header class="grid gap-1">
        <h2 class="text-lg font-semibold" style="color: #1a1a1a">
          {{ 'organizations.details.title' | transloco }}
        </h2>
        <p class="text-sm" style="color: #64748b">
          {{ 'organizations.details.subtitle' | transloco }}
        </p>
      </header>

      <div class="grid items-center gap-4" style="grid-template-columns: auto minmax(0, 1fr)">
        <div
          class="grid h-16 w-16 place-items-center rounded-xl text-xl font-bold"
          style="background: #eef4fb; color: #0E3B63"
        >
          {{ initial() }}
        </div>
        <div class="grid gap-0.5">
          <p class="truncate text-base font-semibold" style="color: #1a1a1a">
            {{ organization().name }}
          </p>
          @if (ownerName(); as owner) {
            <p class="truncate text-sm" style="color: #64748b">
              {{ 'organizations.details.owner' | transloco }} · {{ owner }}
            </p>
          }
        </div>
      </div>

      @if (hasAddress()) {
        <dl class="grid gap-4" style="grid-template-columns: repeat(2, minmax(0, 1fr))">
          @for (field of addressFields(); track field.labelKey) {
            <div class="grid gap-1">
              <dt class="text-xs font-medium uppercase tracking-wide" style="color: #94a3b8">
                {{ field.labelKey | transloco }}
              </dt>
              <dd class="text-sm" style="color: #1a1a1a">{{ field.value || '—' }}</dd>
            </div>
          }
        </dl>
      } @else {
        <div
          role="status"
          class="grid items-start gap-3 rounded-xl border p-4"
          style="border-color: #fde68a; background: #fffbeb; grid-template-columns: auto minmax(0, 1fr)"
        >
          <span aria-hidden="true" class="text-base leading-none" style="color: #b45309">⚠</span>
          <div class="grid gap-1">
            <p class="text-sm font-medium" style="color: #92400e">
              {{ 'organizations.details.missing_address_title' | transloco }}
            </p>
            <p class="text-sm" style="color: #b45309">
              {{ 'organizations.details.missing_address_desc' | transloco }}
            </p>
          </div>
        </div>
      }
    </section>
  `,
})
export class OrganizationDetails {
  private readonly permissions = inject(PermissionService);
  private readonly modal = inject(ModalService);
  private readonly transloco = inject(TranslocoService);

  readonly organization = input.required<OrganizationResponse>();

  /** Editing organization details requires context admin. */
  protected readonly canManage = computed(() => this.permissions.has('organizations', 'admin'));

  protected readonly initial = computed(() =>
    this.organization().name.charAt(0).toUpperCase(),
  );

  protected readonly ownerName = computed(() => {
    const owner = this.organization().owner;
    return owner?.preferredName || owner?.fullName || '';
  });

  protected readonly addressFields = computed(() => {
    const address = this.organization().address;
    return [
      { labelKey: 'organizations.details.address', value: address?.lineOne },
      { labelKey: 'organizations.details.address_line_two', value: address?.lineTwo },
      { labelKey: 'organizations.details.reference', value: address?.reference },
    ];
  });

  protected readonly hasAddress = computed(() =>
    this.addressFields().some((field) => !!field.value),
  );

  protected edit(): void {
    this.modal.open(EditOrganizationModal, {
      title: this.transloco.translate('organizations.details.edit.title'),
      data: this.organization(),
    });
  }
}
