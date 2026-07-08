/// Mirrors the backend `SubscriptionResponse` schema.

/** Available plans, lowest to highest tier. */
export type SubscriptionPlan = 'free' | 'basic' | 'professional';

export interface SubscriptionResponse {
  id: string;
  organizationId: string;
  ownedBy?: string;
  plan: SubscriptionPlan;
  currentPeriodEnd?: string;
  /**
   * Tier the subscription switches to at `currentPeriodEnd`. Set when a downgrade has been
   * scheduled (upgrades apply immediately and are paid upfront). Absent/equal to `plan` means
   * no pending change.
   */
  pendingPlan?: SubscriptionPlan;
  createdAt?: string;
  updatedAt?: string;
}

/** Mirrors the backend `InvoiceResponse` — a past billing document from Stripe. */
export interface InvoiceResponse {
  number?: string;
  status?: string;
  /** Amount paid in the currency's smallest unit (e.g. cents). */
  amountPaid?: number;
  currency?: string;
  createdAt?: string;
  hostedInvoiceUrl?: string;
  invoicePdfUrl?: string;
}
