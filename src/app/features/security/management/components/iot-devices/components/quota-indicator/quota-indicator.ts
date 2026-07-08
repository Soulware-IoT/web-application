import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { Quota, isUnlimited } from '../../../../../../../core/models/iot-device.model';

/** Compact badge showing device usage against the plan limit. */
@Component({
  selector: 'app-quota-indicator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe],
  template: `
    <span
      class="rounded-full px-3 py-1 text-xs font-medium"
      [style.background]="full() ? '#fef2f2' : '#f1f5f9'"
      [style.color]="full() ? '#b91c1c' : '#475569'"
      [title]="(full() ? 'security.quota.full' : 'security.quota.label') | transloco"
    >
      {{
        (unlimited() ? 'security.quota.unlimited' : 'security.quota.usage')
          | transloco: { used: quota().used, limit: quota().limit }
      }}
    </span>
  `,
})
export class QuotaIndicator {
  readonly quota = input.required<Quota>();

  protected readonly unlimited = computed(() => isUnlimited(this.quota()));
  protected readonly full = computed(
    () => !this.unlimited() && this.quota().used >= this.quota().limit,
  );
}
