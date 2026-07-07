import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { InvoiceResponse } from '../../../core/models/subscription.model';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { OrganizationService } from '../../../core/services/organization.service';
import { ProfileService } from '../../../core/services/profile.service';
import { InvoiceListItem } from './components/invoice-list-item/invoice-list-item';

/** Invoices tab: the billing history for the active org's subscription (owner-only). */
@Component({
  selector: 'app-organization-invoices',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe, InvoiceListItem],
  template: `
    @if (canView()) {
      <section
        class="grid content-start gap-6 rounded-2xl border p-6"
        style="border-color: #e2e8f0; background: #ffffff; max-width: 720px"
      >
        <header class="grid gap-1">
          <h2 class="text-lg font-semibold" style="color: #1a1a1a">
            {{ 'organizations.invoices.title' | transloco }}
          </h2>
          <p class="text-sm" style="color: #64748b">
            {{ 'organizations.invoices.subtitle' | transloco }}
          </p>
        </header>

        @if (loading()) {
          <div class="grid gap-3">
            @for (i of skeletonRows; track i) {
              <div class="h-16 animate-pulse rounded-xl" style="background: #eef2f6"></div>
            }
          </div>
        } @else if (invoices().length === 0) {
          <p class="text-sm" style="color: #64748b">
            {{ 'organizations.invoices.empty' | transloco }}
          </p>
        } @else {
          <ul class="grid gap-3">
            @for (invoice of invoices(); track invoice.number) {
              <li><app-invoice-list-item [invoice]="invoice" /></li>
            }
          </ul>
        }
      </section>
    } @else if (!profilesLoading()) {
      <p class="text-sm" style="color: #64748b">
        {{ 'organizations.invoices.view_denied' | transloco }}
      </p>
    }
  `,
})
export class Invoices {
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly organizations = inject(OrganizationService);
  private readonly profiles = inject(ProfileService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly invoices = signal<InvoiceResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly profilesLoading = this.profiles.loading;
  protected readonly skeletonRows = [0, 1, 2];

  /** Billing is owner-only on the backend, so only the org owner may see the invoices. */
  protected readonly canView = computed(() => {
    const me = this.profiles.profile()?.id;
    const org = this.organizations.activeOrg();
    const ownerId = org?.ownedBy ?? org?.owner?.id;
    return !!me && !!ownerId && me === ownerId;
  });

  constructor() {
    // Reload invoices whenever the active org changes and the viewer is its owner.
    effect(() => {
      const org = this.organizations.activeOrg();
      if (!org || !this.canView()) {
        this.invoices.set([]);
        this.loading.set(false);
        return;
      }
      this.load(org.id);
    });
  }

  private load(orgId: string): void {
    this.loading.set(true);
    this.subscriptionService
      .listInvoices(orgId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (invoices) => {
          this.invoices.set(invoices);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('[Invoices] failed to load invoices', err);
          this.invoices.set([]);
          this.loading.set(false);
        },
      });
  }
}
