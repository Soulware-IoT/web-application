import { Injectable } from '@angular/core';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';

/**
 * Loads Stripe.js once and hands out the shared `Stripe` instance. Card data is collected through
 * Stripe Elements (an iframe hosted by Stripe), so raw card numbers never touch our DOM or code.
 */
@Injectable({ providedIn: 'root' })
export class StripeService {
  private stripePromise: Promise<Stripe | null> | null = null;

  /** Resolves the shared Stripe.js instance, loading the script on first use. */
  getStripe(): Promise<Stripe | null> {
    if (!this.stripePromise) {
      this.stripePromise = loadStripe(environment.stripePublishableKey);
    }
    return this.stripePromise;
  }
}
