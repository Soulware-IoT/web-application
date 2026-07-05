import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { InvitationResponse, InvitationStatus } from '../../../../../../../../core/models/invitation.model';
import { ReceivedInvitationService } from '../../../../../../../../core/services/received-invitation.service';

/** Palette per status: [background, text]. */
const STATUS_COLORS: Record<InvitationStatus, { bg: string; fg: string }> = {
  pending: { bg: '#fffbeb', fg: '#b45309' },
  accepted: { bg: '#ecfdf5', fg: '#047857' },
  declined: { bg: '#fef2f2', fg: '#b91c1c' },
};

/**
 * A single received invitation: who invited the user, when, and its status.
 * Pending rows expose Accept/Decline actions wired to the shared service.
 */
@Component({
  selector: 'app-received-invitation-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, TranslocoPipe],
  template: `
    <div
      class="grid gap-3 rounded-xl border p-4"
      style="border-color: #eef2f6; background: #ffffff"
    >
      <div
        class="grid items-center gap-4"
        style="grid-template-columns: auto minmax(0, 1fr) auto"
      >
        <div
          class="grid h-10 w-10 place-items-center rounded-full text-sm font-semibold"
          style="background: #eef4fb; color: #0E3B63"
        >
          {{ initial() }}
        </div>
        <div class="grid gap-0.5">
          <p class="truncate text-sm font-medium" style="color: #1a1a1a">
            @if (inviterName(); as inviter) {
              {{ 'invitations.received.invited_by' | transloco: { name: inviter } }}
            } @else {
              {{ 'invitations.received.invited_you' | transloco }}
            }
          </p>
          @if (dateLabel(); as at) {
            <p class="truncate text-xs" style="color: #64748b">{{ at | date: 'mediumDate' }}</p>
          }
        </div>
        <span
          class="rounded-full px-3 py-1 text-xs font-medium"
          [style.background]="colors().bg"
          [style.color]="colors().fg"
        >
          {{ 'invitations.status.' + invitation().status | transloco }}
        </span>
      </div>

      @if (isPending()) {
        <div class="grid grid-flow-col justify-end gap-2">
          <button
            type="button"
            (click)="decline()"
            [disabled]="busy()"
            class="rounded-[3px] border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-50"
            style="border-color: #e2e8f0; color: #4A4A4F"
          >
            {{ 'invitations.received.decline' | transloco }}
          </button>
          <button
            type="button"
            (click)="accept()"
            [disabled]="busy()"
            class="rounded-[3px] px-3 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style="background-color: #0E3B63"
          >
            {{ 'invitations.received.accept' | transloco }}
          </button>
        </div>
      }
    </div>
  `,
})
export class ReceivedInvitationItem {
  private readonly service = inject(ReceivedInvitationService);

  readonly invitation = input.required<InvitationResponse>();

  protected readonly initial = computed(() => {
    const by = this.invitation().invitedBy;
    const source = by?.preferredName || by?.fullName || this.invitation().email || '?';
    return source.charAt(0).toUpperCase();
  });

  protected readonly inviterName = computed(() => {
    const by = this.invitation().invitedBy;
    return by?.preferredName || by?.fullName || '';
  });

  protected readonly dateLabel = computed(
    () => this.invitation().respondedAt ?? this.invitation().invitedAt ?? '',
  );

  protected readonly isPending = computed(() => this.invitation().status === 'pending');
  protected readonly colors = computed(() => STATUS_COLORS[this.invitation().status]);
  protected readonly busy = computed(() => this.service.responding().has(this.invitation().id));

  protected accept(): void {
    this.service.accept(this.invitation().id);
  }

  protected decline(): void {
    this.service.decline(this.invitation().id);
  }
}
