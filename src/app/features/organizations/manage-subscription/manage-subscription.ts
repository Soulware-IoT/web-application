import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import { SubscriptionPlan } from '../../../core/models/subscription.model';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { OrganizationService } from '../../../core/services/organization.service';
import { ProfileService } from '../../../core/services/profile.service';
import {
  NotificationService,
  httpErrorMessage,
} from '../../../core/notifications/notification.service';
import { PlanOption } from './components/plan-option/plan-option';
import { SimulatedCardField } from './components/simulated-card-field/simulated-card-field';

/** All plans, lowest tier first — the order they appear in the picker. */
const PLANS: readonly SubscriptionPlan[] = ['free', 'basic', 'professional'];

/**
 * Full-page checkout / management view for the active org's subscription, rendered inside the
 * organization layout (owner-only). Subscribe (collecting a card off FREE), switch paid plans,
 * downgrade at period end, or resume a pending cancellation via the subscription endpoints.
 */
@Component({
  selector: 'app-manage-subscription',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, TranslocoPipe, PlanOption, SimulatedCardField],
  template: `
    @if (subscription(); as sub) {
      @if (canManage()) {
        <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]" style="max-width: 960px">
          <div class="grid content-start gap-6">
            <header class="grid gap-1">
              <h2 class="text-lg font-semibold" style="color: #1a1a1a">
                {{ 'organizations.subscription.manage.title' | transloco }}
              </h2>
              <p class="text-sm" style="color: #64748b">
                {{ 'organizations.subscription.manage.subtitle' | transloco }}
              </p>
            </header>

            @if (sub.cancelAtPeriodEnd) {
              <div
                class="grid items-center gap-3 rounded-xl border p-4"
                style="border-color: #fde68a; background: #fffbeb; grid-template-columns: minmax(0, 1fr) auto"
              >
                <p class="text-sm" style="color: #92400e">
                  {{
                    'organizations.subscription.manage.resume_notice'
                      | transloco: { date: (sub.currentPeriodEnd | date: 'mediumDate') }
                  }}
                </p>
                <button
                  type="button"
                  (click)="resume()"
                  [disabled]="saving()"
                  class="rounded-[3px] px-3 py-1.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                  style="background-color: #b45309"
                >
                  {{ 'organizations.subscription.manage.resume' | transloco }}
                </button>
              </div>
            }

            <fieldset class="grid gap-3 border-0 p-0">
              <legend class="mb-2 text-sm font-semibold" style="color: #1a1a1a">
                {{ 'organizations.subscription.manage.choose_plan' | transloco }}
              </legend>
              <div
                class="grid gap-3"
                style="grid-template-columns: repeat(auto-fit, minmax(140px, 1fr))"
              >
                @for (plan of plans; track plan) {
                  <app-plan-option
                    [plan]="plan"
                    [selected]="selectedPlan() === plan"
                    [current]="sub.plan === plan"
                    (select)="selectedPlan.set(plan)"
                  />
                }
              </div>
            </fieldset>

            @if (needsCard()) {
              <section class="grid gap-3 rounded-2xl border p-6" style="border-color: #e2e8f0; background: #ffffff">
                <h3 class="text-sm font-semibold" style="color: #1a1a1a">
                  {{ 'organizations.subscription.manage.card_label' | transloco }}
                </h3>
                <app-simulated-card-field />
              </section>
            }
          </div>

          <aside
            class="grid content-start gap-4 rounded-2xl border p-6 lg:sticky lg:top-6"
            style="border-color: #e2e8f0; background: #ffffff"
          >
            <h3 class="text-sm font-semibold" style="color: #1a1a1a">
              {{ 'organizations.subscription.manage.summary' | transloco }}
            </h3>

            @if (showSummary()) {
              <div class="grid gap-2 text-sm" style="color: #1a1a1a">
                <div class="flex items-center justify-between">
                  <span>{{ 'organizations.subscription.plans.' + selectedPlan() | transloco }}</span>
                  <span>{{ 'organizations.subscription.manage.prices.' + selectedPlan() | transloco }}</span>
                </div>
                <div
                  class="flex items-center justify-between border-t pt-2 font-semibold"
                  style="border-color: #e2e8f0"
                >
                  <span>{{ 'organizations.subscription.manage.total' | transloco }}</span>
                  <span>{{ 'organizations.subscription.manage.prices.' + selectedPlan() | transloco }}</span>
                </div>
              </div>
            } @else {
              <p class="text-sm" style="color: #64748b">
                {{ 'organizations.subscription.manage.summary_hint' | transloco }}
              </p>
            }

            <button
              type="button"
              (click)="confirm()"
              [disabled]="!isChange() || saving() || (needsCard() && !cardComplete())"
              class="rounded-[3px] px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
              style="background-color: #0E3B63"
            >
              {{ (saving() ? 'organizations.subscription.manage.saving' : confirmKey()) | transloco }}
            </button>
          </aside>
        </div>
      } @else if (!profilesLoading()) {
        <p class="text-sm" style="color: #64748b">
          {{ 'organizations.subscription.manage.error' | transloco }}
        </p>
      }
    } @else {
      <div class="h-40 animate-pulse rounded-2xl" style="background: #eef2f6; max-width: 960px"></div>
    }
  `,
})
export class ManageSubscription {
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly organizations = inject(OrganizationService);
  private readonly profiles = inject(ProfileService);
  private readonly notifications = inject(NotificationService);
  private readonly transloco = inject(TranslocoService);

  private readonly cardField = viewChild(SimulatedCardField);

  protected readonly plans = PLANS;
  protected readonly subscription = this.subscriptionService.subscription;
  protected readonly profilesLoading = this.profiles.loading;
  protected readonly saving = signal(false);

  /** Seeds from the current plan and re-seeds if the subscription reloads, but honors local selection. */
  protected readonly selectedPlan = linkedSignal<SubscriptionPlan>(
    () => this.subscription()?.plan ?? 'free',
  );

  /** Managing billing is owner-only on the backend, so only the org owner may act here. */
  protected readonly canManage = computed(() => {
    const me = this.profiles.profile()?.id;
    const org = this.organizations.activeOrg();
    const ownerId = org?.ownedBy ?? org?.owner?.id;
    return !!me && !!ownerId && me === ownerId;
  });

  protected readonly isChange = computed(
    () => this.selectedPlan() !== (this.subscription()?.plan ?? 'free'),
  );
  /** A card is required only when the org has no Stripe subscription yet (currently FREE) and moves to a paid plan. */
  protected readonly needsCard = computed(
    () => (this.subscription()?.plan ?? 'free') === 'free' && this.selectedPlan() !== 'free',
  );
  protected readonly showSummary = computed(() => this.isChange() && this.selectedPlan() !== 'free');
  /** When a card is required, the pay button waits until the (simulated) card fields are filled. */
  protected readonly cardComplete = computed(() => this.cardField()?.complete() ?? false);

  protected readonly confirmKey = computed(() => {
    if (this.selectedPlan() === 'free') return 'organizations.subscription.manage.confirm_downgrade';
    if (this.needsCard()) return 'organizations.subscription.manage.pay';
    return 'organizations.subscription.manage.confirm_change';
  });

  protected async confirm(): Promise<void> {
    const sub = this.subscription();
    if (!sub || !this.isChange() || this.saving()) return;
    const plan = this.selectedPlan();
    this.saving.set(true);

    try {
      let paymentMethodId: string | undefined;
      if (this.needsCard()) {
        const field = this.cardField();
        if (!field?.complete()) throw new Error('Card field is not ready');
        paymentMethodId = field.paymentMethodId();
      }

      const request$ =
        plan === 'free'
          ? this.subscriptionService.downgrade(sub.organizationId)
          : this.subscriptionService.changePlan(sub.organizationId, plan, paymentMethodId);

      await firstValueFrom(request$);
      const successKey =
        plan === 'free'
          ? 'organizations.subscription.manage.success_downgraded'
          : 'organizations.subscription.manage.success_changed';
      this.notifications.success(this.transloco.translate(successKey));
      this.saving.set(false);
    } catch (err) {
      this.saving.set(false);
      this.notifications.error(this.messageFor(err));
    }
  }

  protected async resume(): Promise<void> {
    const sub = this.subscription();
    if (!sub || this.saving()) return;
    this.saving.set(true);

    try {
      await firstValueFrom(this.subscriptionService.resume(sub.organizationId));
      this.notifications.success(
        this.transloco.translate('organizations.subscription.manage.success_resumed'),
      );
      this.saving.set(false);
    } catch (err) {
      this.saving.set(false);
      this.notifications.error(this.messageFor(err));
    }
  }

  private messageFor(err: unknown): string {
    if (err instanceof HttpErrorResponse) return httpErrorMessage(err);
    if (err instanceof Error) return err.message;
    return this.transloco.translate('organizations.subscription.manage.error');
  }
}
