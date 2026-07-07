import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { InvitationResponse, InvitationStatus } from '../../../../../core/models/invitation.model';

/** Palette per status: [background, text]. */
const STATUS_COLORS: Record<InvitationStatus, { bg: string; fg: string }> = {
  pending: { bg: '#fffbeb', fg: '#b45309' },
  accepted: { bg: '#ecfdf5', fg: '#047857' },
  declined: { bg: '#fef2f2', fg: '#b91c1c' },
};

/** A single invitation row: recipient, inviter, date and status badge. */
@Component({
  selector: 'app-invitation-list-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, TranslocoPipe],
  template: `
    <div
      class="grid items-center gap-4 rounded-xl border p-4"
      style="grid-template-columns: auto minmax(0, 1fr) auto; border-color: #eef2f6; background: #ffffff"
    >
      <div
        class="grid h-10 w-10 place-items-center rounded-full text-sm font-semibold"
        style="background: #eef4fb; color: #0E3B63"
      >
        {{ initial() }}
      </div>
      <div class="grid gap-0.5">
        <p class="truncate text-sm font-medium" style="color: #1a1a1a">
          {{ invitation().email }}
        </p>
        <p class="truncate text-xs" style="color: #64748b">
          @if (inviterName(); as inviter) {
            {{ 'organizations.invitations.invited_by' | transloco: { name: inviter } }}
          }
          @if (invitation().invitedAt; as at) {
            @if (inviterName()) {
              ·
            }
            {{ at | date: 'mediumDate' }}
          }
        </p>
      </div>
      <span
        class="rounded-full px-3 py-1 text-xs font-medium"
        [style.background]="colors().bg"
        [style.color]="colors().fg"
      >
        {{ 'organizations.invitations.status.' + invitation().status | transloco }}
      </span>
    </div>
  `,
})
export class InvitationListItem {
  readonly invitation = input.required<InvitationResponse>();

  protected readonly initial = computed(() =>
    (this.invitation().email || '?').charAt(0).toUpperCase(),
  );

  protected readonly inviterName = computed(() => {
    const by = this.invitation().invitedBy;
    return by?.preferredName || by?.fullName || '';
  });

  protected readonly colors = computed(() => STATUS_COLORS[this.invitation().status]);
}
