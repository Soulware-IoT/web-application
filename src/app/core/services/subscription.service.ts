import { Injectable, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { OrganizationService } from './organization.service';
import { SubscriptionResponse } from '../models/subscription.model';

/** Subscription of the active organization, reloaded when the active org changes. */
@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly http = inject(HttpClient);
  private readonly organizations = inject(OrganizationService);

  readonly subscription = signal<SubscriptionResponse | null>(null);
  readonly loading = signal(false);

  private loadedOrgId: string | null = null;

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
