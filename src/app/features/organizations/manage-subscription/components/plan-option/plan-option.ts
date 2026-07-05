import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { SubscriptionPlan } from '../../../../../core/models/subscription.model';

/** A single selectable plan in the manage-subscription radiogroup. */
@Component({
  selector: 'app-plan-option',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe],
  template: `
    <label
      class="relative grid cursor-pointer content-start gap-2 rounded-xl border p-4 transition-colors"
      style="border-width: 2px"
      [style.border-color]="selected() ? '#0E3B63' : '#e2e8f0'"
      [style.background]="selected() ? '#eef4fb' : '#ffffff'"
    >
      <span class="flex items-center justify-between gap-2">
        <span class="text-sm font-semibold" style="color: #1a1a1a">
          {{ 'organizations.subscription.plans.' + plan() | transloco }}
        </span>
        <input
          type="radio"
          name="subscription-plan"
          class="h-4 w-4"
          style="accent-color: #0E3B63"
          [checked]="selected()"
          (change)="select.emit()"
        />
      </span>
      <span class="text-lg font-bold" style="color: #0E3B63">
        {{ 'organizations.subscription.manage.prices.' + plan() | transloco }}
      </span>
      @if (current()) {
        <span
          class="justify-self-start rounded-full px-2 py-0.5 text-xs font-medium"
          style="background: #e2e8f0; color: #475569"
        >
          {{ 'organizations.subscription.manage.current' | transloco }}
        </span>
      }
    </label>
  `,
})
export class PlanOption {
  readonly plan = input.required<SubscriptionPlan>();
  readonly selected = input.required<boolean>();
  readonly current = input(false);
  readonly select = output<void>();
}
