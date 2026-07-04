/// Mirrors the backend `SubscriptionResponse` schema.

/** Available plans, lowest to highest tier. */
export type SubscriptionPlan = 'free' | 'basic' | 'professional';

export interface SubscriptionResponse {
  id: string;
  organizationId: string;
  ownedBy?: string;
  plan: SubscriptionPlan;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
