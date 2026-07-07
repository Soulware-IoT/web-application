import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { INVITATION_STATUSES, InvitationStatus } from '../../../../../core/models/invitation.model';

/** Filter option: `null` means "all statuses". */
export type StatusFilter = InvitationStatus | null;

/** Segmented control to filter the invitation list by status. */
@Component({
  selector: 'app-invitation-filter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe],
  template: `
    <div
      role="group"
      [attr.aria-label]="'organizations.invitations.filter_label' | transloco"
      class="flex flex-wrap gap-2"
    >
      @for (option of options; track option.value) {
        <button
          type="button"
          (click)="selected.emit(option.value)"
          [attr.aria-pressed]="active() === option.value"
          class="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
          [style.border-color]="active() === option.value ? '#0E3B63' : '#e2e8f0'"
          [style.background]="active() === option.value ? '#eef4fb' : '#ffffff'"
          [style.color]="active() === option.value ? '#0E3B63' : '#64748b'"
        >
          {{ option.labelKey | transloco }}
        </button>
      }
    </div>
  `,
})
export class InvitationFilter {
  readonly active = input.required<StatusFilter>();
  readonly selected = output<StatusFilter>();

  protected readonly options: { value: StatusFilter; labelKey: string }[] = [
    { value: null, labelKey: 'organizations.invitations.status_filter.all' },
    ...INVITATION_STATUSES.map((status) => ({
      value: status,
      labelKey: 'organizations.invitations.status.' + status,
    })),
  ];
}
