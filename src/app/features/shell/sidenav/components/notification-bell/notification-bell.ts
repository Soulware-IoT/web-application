import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { ModalService } from '../../../../../core/modal/modal.service';
import { ReceivedInvitationService } from '../../../../../core/services/received-invitation.service';
import { InvitationsModal } from './invitations-modal/invitations-modal';

/** Bell in the nav; badges the count of pending invitations and opens their modal. */
@Component({
  selector: 'app-notification-bell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      (click)="open()"
      [attr.aria-label]="ariaLabel()"
      class="relative grid h-9 w-9 place-items-center rounded-[2px] transition-colors hover:bg-gray-100"
      style="color: #1a1a1a"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      @if (count() > 0) {
        <span
          aria-hidden="true"
          class="absolute grid min-w-4 place-items-center rounded-full px-1 text-[10px] font-semibold leading-4 text-white"
          style="top: 2px; right: 2px; background-color: #dc2626"
        >
          {{ badgeLabel() }}
        </span>
      }
    </button>
  `,
})
export class NotificationBell {
  private readonly modal = inject(ModalService);
  private readonly transloco = inject(TranslocoService);
  private readonly invitations = inject(ReceivedInvitationService);

  protected readonly count = this.invitations.pendingCount;
  protected readonly badgeLabel = computed(() => (this.count() > 9 ? '9+' : String(this.count())));

  protected readonly ariaLabel = computed(() =>
    this.transloco.translate('invitations.received.bell_label', { count: this.count() }),
  );

  protected open(): void {
    this.modal.open(InvitationsModal, {
      title: this.transloco.translate('invitations.received.title'),
    });
  }
}
