import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { InvitationService } from '../../../core/services/invitation.service';
import { PermissionService } from '../../../core/services/permission.service';
import { InviteForm } from './components/invite-form/invite-form';
import { InvitationFilter, StatusFilter } from './components/invitation-filter/invitation-filter';
import { InvitationListItem } from './components/invitation-list-item/invitation-list-item';

/** Invitations tab: send invitations and browse them filtered by status. */
@Component({
  selector: 'app-organization-invitations',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe, InviteForm, InvitationFilter, InvitationListItem],
  template: `
    @if (!canView()) {
      <p class="text-sm" style="color: #64748b">
        {{ 'organizations.invitations.view_denied' | transloco }}
      </p>
    } @else {
      <section
        class="grid content-start gap-6 rounded-2xl border p-6"
        style="border-color: #e2e8f0; background: #ffffff; max-width: 720px"
      >
        <header class="grid gap-1">
          <h2 class="text-lg font-semibold" style="color: #1a1a1a">
            {{ 'organizations.invitations.title' | transloco }}
          </h2>
          <p class="text-sm" style="color: #64748b">
            {{ 'organizations.invitations.subtitle' | transloco }}
          </p>
        </header>

        @if (canInvite()) {
          <app-invite-form />
        }

        <app-invitation-filter [active]="filter()" (selected)="filter.set($event)" />

        @if (loading()) {
          <div class="grid gap-3" role="status" aria-busy="true">
            <span class="sr-only">{{ 'organizations.invitations.loading' | transloco }}</span>
            @for (row of skeletonRows; track row) {
              <div class="h-16 animate-pulse rounded-xl" style="background: #f1f5f9"></div>
            }
          </div>
        } @else if (filtered().length === 0) {
          <div
            class="grid place-items-center rounded-xl border border-dashed p-8 text-center"
            style="border-color: #cbd5e1"
          >
            <p class="text-sm" style="color: #64748b">
              {{
                (filter()
                  ? 'organizations.invitations.no_matches'
                  : 'organizations.invitations.empty'
                ) | transloco
              }}
            </p>
          </div>
        } @else {
          <ul class="grid gap-3">
            @for (invitation of filtered(); track invitation.id) {
              <li><app-invitation-list-item [invitation]="invitation" /></li>
            }
          </ul>
        }
      </section>
    }
  `,
})
export class Invitations {
  private readonly invitationService = inject(InvitationService);
  private readonly permissions = inject(PermissionService);

  protected readonly loading = this.invitationService.loading;
  protected readonly filter = signal<StatusFilter>(null);
  protected readonly skeletonRows = [0, 1, 2];

  /** Viewing invitations requires at least lieutenant in the organizations context. */
  protected readonly canView = computed(() => this.permissions.has('organizations', 'lieutenant'));

  /** Sending invitations requires org-admin. */
  protected readonly canInvite = computed(() => this.permissions.has('organizations', 'admin'));

  protected readonly filtered = computed(() => {
    const status = this.filter();
    const all = this.invitationService.invitations();
    return status ? all.filter((invitation) => invitation.status === status) : all;
  });
}
