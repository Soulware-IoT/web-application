import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ReceivedInvitationService } from '../../../../../../core/services/received-invitation.service';
import { ReceivedInvitationItem } from './components/received-invitation-item/received-invitation-item';

type Tab = 'pending' | 'responded';

/** Received invitations split across two tabs: awaiting a response vs. resolved. */
@Component({
  selector: 'app-invitations-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe, ReceivedInvitationItem],
  template: `
    <div class="grid gap-4">
      <div role="tablist" [attr.aria-label]="'invitations.received.tabs_label' | transloco" class="flex gap-2">
        @for (option of tabs; track option.value) {
          <button
            type="button"
            role="tab"
            [id]="'invitations-tab-' + option.value"
            [attr.aria-selected]="tab() === option.value"
            [attr.aria-controls]="'invitations-panel-' + option.value"
            (click)="tab.set(option.value)"
            class="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
            [style.border-color]="tab() === option.value ? '#0E3B63' : '#e2e8f0'"
            [style.background]="tab() === option.value ? '#eef4fb' : '#ffffff'"
            [style.color]="tab() === option.value ? '#0E3B63' : '#64748b'"
          >
            {{ option.labelKey | transloco }}
            @if (option.value === 'pending' && pendingCount() > 0) {
              <span class="ml-1 font-semibold">({{ pendingCount() }})</span>
            }
          </button>
        }
      </div>

      <div
        role="tabpanel"
        [id]="'invitations-panel-' + tab()"
        [attr.aria-labelledby]="'invitations-tab-' + tab()"
      >
        @if (loading()) {
          <div class="grid gap-3" role="status" aria-busy="true">
            <span class="sr-only">{{ 'invitations.received.loading' | transloco }}</span>
            @for (row of skeletonRows; track row) {
              <div class="h-20 animate-pulse rounded-xl" style="background: #f1f5f9"></div>
            }
          </div>
        } @else if (visible().length === 0) {
          <div
            class="grid place-items-center rounded-xl border border-dashed p-8 text-center"
            style="border-color: #cbd5e1"
          >
            <p class="text-sm" style="color: #64748b">
              {{ 'invitations.received.empty.' + tab() | transloco }}
            </p>
          </div>
        } @else {
          <ul class="grid gap-3">
            @for (invitation of visible(); track invitation.id) {
              <li><app-received-invitation-item [invitation]="invitation" /></li>
            }
          </ul>
        }
      </div>
    </div>
  `,
})
export class InvitationsModal {
  private readonly service = inject(ReceivedInvitationService);

  protected readonly loading = this.service.loading;
  protected readonly pendingCount = this.service.pendingCount;
  protected readonly tab = signal<Tab>('pending');
  protected readonly skeletonRows = [0, 1];

  protected readonly tabs: { value: Tab; labelKey: string }[] = [
    { value: 'pending', labelKey: 'invitations.received.tab_pending' },
    { value: 'responded', labelKey: 'invitations.received.tab_responded' },
  ];

  protected readonly visible = computed(() => {
    const invitations = this.service.invitations();
    return this.tab() === 'pending'
      ? invitations.filter((invitation) => invitation.status === 'pending')
      : invitations.filter((invitation) => invitation.status !== 'pending');
  });
}
