import { Injectable, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrganizationService } from './organization.service';
import {
  InvoiceResponse,
  SubscriptionPlan,
  SubscriptionResponse,
} from '../models/subscription.model';

/** Subscription of the active organization, reloaded when the active org changes. */
@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly http = inject(HttpClient);
  private readonly organizations = inject(OrganizationService);

  readonly subscription = signal<SubscriptionResponse | null>(null);
  readonly loading = signal(false);

  private loadedOrgId: string | null = null;

  /**
   * Upgrades or switches to a paid plan. A `paymentMethodId` (Stripe `pm_...`) is required the first
   * time an org subscribes (no Stripe subscription yet); switching between paid plans reuses the card on file.
   */
  changePlan(orgId: string, plan: SubscriptionPlan, paymentMethodId?: string) {
    return this.http
      .post<SubscriptionResponse>(
        `${environment.apiUrl}/organizations/${orgId}/subscription/plan`,
        { plan, paymentMethodId },
      )
      .pipe(tap((sub) => this.applyIfActive(orgId, sub)));
  }

  /** Schedules a downgrade to the free plan at the end of the current paid period. */
  downgrade(orgId: string) {
    return this.http
      .post<SubscriptionResponse>(
        `${environment.apiUrl}/organizations/${orgId}/subscription/downgrade`,
        {},
      )
      .pipe(tap((sub) => this.applyIfActive(orgId, sub)));
  }

  /** Cancels a pending end-of-period downgrade — the subscription keeps renewing. */
  resume(orgId: string) {
    return this.http
      .post<SubscriptionResponse>(
        `${environment.apiUrl}/organizations/${orgId}/subscription/resume`,
        {},
      )
      .pipe(tap((sub) => this.applyIfActive(orgId, sub)));
  }

  /** Past invoices for the org's subscription, newest first from Stripe. Fetched on demand. */
  listInvoices(orgId: string) {
    return this.http.get<InvoiceResponse[]>(
      `${environment.apiUrl}/organizations/${orgId}/subscription/invoices`,
    );
  }

  private applyIfActive(orgId: string, sub: SubscriptionResponse): void {
    if (this.organizations.activeOrg()?.id === orgId) this.subscription.set(sub);
  }

  constructor() {
    effect(() => {
      const org = this.organizations.activeOrg();

      if (!org) {
        this.loadedOrgId = null;
        this.subscription.set(null);
        return;
      }
      if (org.id === this.loadedOrgId) return;

      this.loadedOrgId = org.id;
      this.load(org.id);
    });
  }

  private load(orgId: string): void {
    this.loading.set(true);
    this.http
      .get<SubscriptionResponse>(`${environment.apiUrl}/organizations/${orgId}/subscription`)
      .subscribe({
        next: (subscription) => {
          this.subscription.set(subscription);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('[SubscriptionService] failed to load subscription', err);
          this.subscription.set(null);
          this.loading.set(false);
          this.loadedOrgId = null;
        },
      });
  }
}
