import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  OrganizationMemberResponse,
  PermissionLevel,
} from '../../../../core/models/organization-member.model';

/** Etiquetas legibles para el nivel de permiso más alto de cada miembro. */
const LEVEL_LABEL: Record<PermissionLevel, string> = {
  none: 'Sin acceso',
  assignee: 'Colaborador',
  lieutenant: 'Supervisor',
  admin: 'Administrador',
};

/** Listado de miembros de la organización con su rol principal. */
@Component({
  selector: 'app-organization-members',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="grid gap-6 rounded-2xl border p-6"
      style="border-color: #e2e8f0; background: #ffffff"
    >
      <header class="grid items-center gap-4" style="grid-template-columns: minmax(0, 1fr) auto">
        <div class="grid gap-1">
          <h2 class="text-lg font-semibold" style="color: #1a1a1a">Miembros</h2>
          <p class="text-sm" style="color: #64748b">
            {{ members().length }} persona(s) en la organización.
          </p>
        </div>
        <button
          type="button"
          class="rounded-lg px-4 py-2 text-sm font-medium text-white"
          style="background: #0E3B63"
        >
          Invitar miembro
        </button>
      </header>

      <ul class="grid gap-3">
        @for (member of members(); track member.id) {
          <li
            class="grid items-center gap-4 rounded-xl border p-4"
            style="border-color: #eef2f6; grid-template-columns: auto minmax(0, 1fr) auto"
          >
            <div
              class="grid h-10 w-10 place-items-center rounded-full text-sm font-semibold"
              style="background: #eef4fb; color: #0E3B63"
            >
              {{ initial(member) }}
            </div>
            <div class="grid gap-0.5">
              <p class="truncate text-sm font-medium" style="color: #1a1a1a">
                {{ member.profile.preferredName || member.profile.fullName || 'Sin nombre' }}
              </p>
              <p class="truncate text-xs" style="color: #64748b">
                {{ member.profile.email || '—' }}
              </p>
            </div>
            <span
              class="rounded-full px-3 py-1 text-xs font-medium"
              style="background: #f1f5f9; color: #475569"
            >
              {{ topRole(member) }}
            </span>
          </li>
        }
      </ul>
    </section>
  `,
})
export class OrganizationMembers {
  readonly members = input.required<OrganizationMemberResponse[]>();

  protected initial(member: OrganizationMemberResponse) {
    const name = member.profile.preferredName || member.profile.fullName || '?';
    return name.charAt(0).toUpperCase();
  }

  protected topRole(member: OrganizationMemberResponse) {
    const levels = Object.values(member.permissions);
    const highest = levels.reduce<PermissionLevel>(
      (best, level) => (this.rank(level) > this.rank(best) ? level : best),
      'none',
    );
    return LEVEL_LABEL[highest];
  }

  private rank(level: PermissionLevel) {
    return { none: 0, assignee: 1, lieutenant: 2, admin: 3 }[level];
  }
}
