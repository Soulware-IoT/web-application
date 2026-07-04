import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { OrganizationResponse } from '../../../../core/models/organization.model';

/** Datos generales de la organización: identidad y dirección. */
@Component({
  selector: 'app-organization-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe],
  template: `
    <section
      class="grid gap-6 rounded-2xl border p-6"
      style="border-color: #e2e8f0; background: #ffffff"
    >
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
  readonly organization = input.required<OrganizationResponse>();

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
}
