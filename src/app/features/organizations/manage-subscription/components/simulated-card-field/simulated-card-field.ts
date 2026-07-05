import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

/**
 * A simulated card-entry form for the demo. It does NOT tokenize a real card — the fields are cosmetic
 * (pre-filled with a Stripe test card). On submit the parent sends a Stripe predefined test PaymentMethod
 * id (see {@link paymentMethodId}) to the backend, which creates a real subscription in Stripe test mode.
 */
@Component({
  selector: 'app-simulated-card-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe],
  template: `
    <div class="grid gap-3">
      <div class="grid gap-1.5">
        <label for="sim-card-number" class="text-sm font-medium" style="color: #1a1a1a">
          {{ 'organizations.subscription.manage.card_number' | transloco }}
        </label>
        <input
          id="sim-card-number"
          inputmode="numeric"
          autocomplete="cc-number"
          maxlength="19"
          placeholder="4242 4242 4242 4242"
          [value]="number()"
          (input)="onNumber($any($event.target).value)"
          class="rounded-[3px] border px-3 py-2 text-sm outline-none focus:border-[#0E3B63]"
          style="border-color: #e2e8f0; color: #1a1a1a"
        />
      </div>

      <div class="grid gap-3" style="grid-template-columns: 1fr 1fr">
        <div class="grid gap-1.5">
          <label for="sim-card-expiry" class="text-sm font-medium" style="color: #1a1a1a">
            {{ 'organizations.subscription.manage.card_expiry' | transloco }}
          </label>
          <input
            id="sim-card-expiry"
            inputmode="numeric"
            autocomplete="cc-exp"
            maxlength="7"
            placeholder="12 / 34"
            [value]="expiry()"
            (input)="onExpiry($any($event.target).value)"
            class="rounded-[3px] border px-3 py-2 text-sm outline-none focus:border-[#0E3B63]"
            style="border-color: #e2e8f0; color: #1a1a1a"
          />
        </div>
        <div class="grid gap-1.5">
          <label for="sim-card-cvc" class="text-sm font-medium" style="color: #1a1a1a">
            {{ 'organizations.subscription.manage.card_cvc' | transloco }}
          </label>
          <input
            id="sim-card-cvc"
            inputmode="numeric"
            autocomplete="cc-csc"
            maxlength="4"
            placeholder="123"
            [value]="cvc()"
            (input)="onCvc($any($event.target).value)"
            class="rounded-[3px] border px-3 py-2 text-sm outline-none focus:border-[#0E3B63]"
            style="border-color: #e2e8f0; color: #1a1a1a"
          />
        </div>
      </div>

      <div class="grid gap-1.5">
        <label for="sim-card-name" class="text-sm font-medium" style="color: #1a1a1a">
          {{ 'organizations.subscription.manage.card_name' | transloco }}
        </label>
        <input
          id="sim-card-name"
          autocomplete="cc-name"
          [value]="name()"
          (input)="name.set($any($event.target).value)"
          class="rounded-[3px] border px-3 py-2 text-sm outline-none focus:border-[#0E3B63]"
          style="border-color: #e2e8f0; color: #1a1a1a"
        />
      </div>

      <p class="text-xs" style="color: #94a3b8">
        {{ 'organizations.subscription.manage.card_hint' | transloco }}
      </p>
    </div>
  `,
})
export class SimulatedCardField {
  // Empty by default; the placeholders hint the Stripe test card to enter.
  protected readonly number = signal('');
  protected readonly expiry = signal('');
  protected readonly cvc = signal('');
  protected readonly name = signal('');

  /** All required fields entered — the parent gates the pay button on this. */
  readonly complete = computed(
    () => this.number().trim() !== '' && this.expiry().trim() !== '' && this.cvc().trim() !== '',
  );

  /**
   * Maps the (cosmetic) card number to a Stripe predefined test PaymentMethod id. These work server-side
   * in test mode without Stripe.js Elements, so the backend can create a real test subscription.
   */
  readonly paymentMethodId = computed(() => {
    const digits = this.number().replace(/\D/g, '');
    if (digits.startsWith('5')) return 'pm_card_mastercard';
    if (digits.startsWith('34') || digits.startsWith('37')) return 'pm_card_amex';
    return 'pm_card_visa';
  });

  /** Digits only, grouped in fours: "4242424242" -> "4242 4242 42". */
  protected onNumber(raw: string): void {
    const digits = raw.replace(/\D/g, '').slice(0, 16);
    this.number.set(digits.match(/.{1,4}/g)?.join(' ') ?? '');
  }

  /** Digits only, split after the month: "1234" -> "12 / 34". */
  protected onExpiry(raw: string): void {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    this.expiry.set(digits.length <= 2 ? digits : `${digits.slice(0, 2)} / ${digits.slice(2)}`);
  }

  /** Digits only. */
  protected onCvc(raw: string): void {
    this.cvc.set(raw.replace(/\D/g, '').slice(0, 4));
  }
}

