import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Resumen de la suscripción con acceso al portal de facturación. */
export interface SubscriptionSummary {
  planName: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled';
  seatsUsed: number;
  seatsTotal: number;
  renewsAt: string;
}

const STATUS_LABEL: Record<SubscriptionSummary['status'], string> = {
  active: 'Activa',
  trialing: 'Prueba',
  past_due: 'Pago pendiente',
  canceled: 'Cancelada',
};

@Component({
  selector: 'app-organization-subscription',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="grid gap-6 rounded-2xl border p-6"
      style="border-color: #e2e8f0; background: #ffffff"
    >
      <header class="grid gap-1">
        <h2 class="text-lg font-semibold" style="color: #1a1a1a">Suscripción</h2>
        <p class="text-sm" style="color: #64748b">Plan actual y facturación.</p>
      </header>

      <div
        class="grid gap-4 rounded-xl p-5"
        style="background: #0E3B63; grid-template-columns: minmax(0, 1fr) auto"
      >
        <div class="grid gap-1">
          <p class="text-xs font-medium uppercase tracking-wide" style="color: #9db8d4">Plan</p>
          <p class="text-xl font-bold text-white">{{ subscription().planName }}</p>
        </div>
        <span
          class="self-start rounded-full px-3 py-1 text-xs font-medium"
          style="background: rgba(255, 255, 255, 0.15); color: #ffffff"
        >
          {{ statusLabel() }}
        </span>
      </div>

      <dl class="grid gap-4" style="grid-template-columns: repeat(2, minmax(0, 1fr))">
        <div class="grid gap-1">
          <dt class="text-xs font-medium uppercase tracking-wide" style="color: #94a3b8">
            Asientos
          </dt>
          <dd class="text-sm" style="color: #1a1a1a">
            {{ subscription().seatsUsed }} / {{ subscription().seatsTotal }}
          </dd>
        </div>
        <div class="grid gap-1">
          <dt class="text-xs font-medium uppercase tracking-wide" style="color: #94a3b8">
            Renueva
          </dt>
          <dd class="text-sm" style="color: #1a1a1a">{{ subscription().renewsAt }}</dd>
        </div>
      </dl>

      <button
        type="button"
        class="rounded-lg border px-4 py-2 text-sm font-medium"
        style="border-color: #0E3B63; color: #0E3B63"
      >
        Gestionar suscripción
      </button>
    </section>
  `,
})
export class OrganizationSubscription {
  readonly subscription = input.required<SubscriptionSummary>();

  protected statusLabel() {
    return STATUS_LABEL[this.subscription().status];
  }
}
