import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { OrganizationResponse } from '../../../../core/models/organization.model';

/** Datos generales de la organización: identidad, dirección y metadatos. */
@Component({
  selector: 'app-organization-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="grid gap-6 rounded-2xl border p-6"
      style="border-color: #e2e8f0; background: #ffffff"
    >
      <header class="grid gap-1">
        <h2 class="text-lg font-semibold" style="color: #1a1a1a">Datos de la organización</h2>
        <p class="text-sm" style="color: #64748b">Información general y de contacto.</p>
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
          <p class="truncate text-sm" style="color: #64748b">ID · {{ organization().id }}</p>
        </div>
      </div>

      <dl class="grid gap-4" style="grid-template-columns: repeat(2, minmax(0, 1fr))">
        @for (field of fields(); track field.label) {
          <div class="grid gap-1">
            <dt class="text-xs font-medium uppercase tracking-wide" style="color: #94a3b8">
              {{ field.label }}
            </dt>
            <dd class="text-sm" style="color: #1a1a1a">{{ field.value || '—' }}</dd>
          </div>
        }
      </dl>
    </section>
  `,
})
export class OrganizationDetails {
  readonly organization = input.required<OrganizationResponse>();

  protected initial() {
    return this.organization().name.charAt(0).toUpperCase();
  }

  protected fields() {
    const org = this.organization();
    return [
      { label: 'Dirección', value: org.addressLineOne },
      { label: 'Complemento', value: org.addressLineTwo },
      { label: 'Referencia', value: org.addressReference },
      { label: 'Propietario', value: org.ownedBy },
    ];
  }
}
