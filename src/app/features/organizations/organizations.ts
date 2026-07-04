import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { OrganizationResponse } from '../../core/models/organization.model';
import { OrganizationMemberResponse } from '../../core/models/organization-member.model';
import { OrganizationDetails } from './components/organization-details/organization-details';
import { OrganizationMembers } from './components/organization-members/organization-members';
import {
  OrganizationSubscription,
  SubscriptionSummary,
} from './components/organization-subscription/organization-subscription';

@Component({
  selector: 'app-organizations',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OrganizationDetails, OrganizationMembers, OrganizationSubscription],
  template: `
    <div class="grid gap-8 p-8" style="align-content: start">
      <header class="grid gap-1">
        <h1 class="text-3xl font-bold" style="color: #1a1a1a">Organización</h1>
        <p class="text-sm" style="color: #64748b">
          Datos, miembros y suscripción de tu organización.
        </p>
      </header>

      <div class="grid gap-6" style="grid-template-columns: minmax(0, 2fr) minmax(0, 1fr)">
        <app-organization-details [organization]="organization()" />
        <app-organization-subscription [subscription]="subscription()" />
      </div>

      <app-organization-members [members]="members()" />
    </div>
  `,
})
export class Organizations {
  // Datos mock — layout estático hasta cablear el servicio real.
  protected readonly organization = signal<OrganizationResponse>({
    id: 'org_a1b2c3',
    name: 'Acme S.A.',
    addressLineOne: 'Av. Principal 1234',
    addressLineTwo: 'Piso 4, Oficina B',
    addressReference: 'Frente a la plaza central',
    ownedBy: 'Ana García',
  });

  protected readonly subscription = signal<SubscriptionSummary>({
    planName: 'Plan Empresa',
    status: 'active',
    seatsUsed: 8,
    seatsTotal: 15,
    renewsAt: '15 ago 2026',
  });

  protected readonly members = signal<OrganizationMemberResponse[]>([
    {
      id: 'mem_1',
      organizationId: 'org_a1b2c3',
      permissions: { security: 'admin', organizations: 'admin', internalControl: 'admin' },
      profile: { id: 'u1', fullName: 'Ana García', preferredName: 'Ana', email: 'ana@acme.com' },
    },
    {
      id: 'mem_2',
      organizationId: 'org_a1b2c3',
      permissions: { security: 'none', organizations: 'lieutenant', internalControl: 'admin' },
      profile: { id: 'u2', fullName: 'Bruno López', email: 'bruno@acme.com' },
    },
    {
      id: 'mem_3',
      organizationId: 'org_a1b2c3',
      permissions: { security: 'none', organizations: 'assignee', internalControl: 'assignee' },
      profile: { id: 'u3', fullName: 'Carla Ruiz', email: 'carla@acme.com' },
    },
  ]);
}
