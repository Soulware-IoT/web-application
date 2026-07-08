import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { EdgeDeviceResponse } from '../../../../../../../core/models/edge-device.model';
import { DevicePresenceService } from '../../../../../../../core/services/device-presence.service';
import { EdgeDeviceService } from '../../../../../../../core/services/edge-device.service';
import { PermissionService } from '../../../../../../../core/services/permission.service';
import { ModalService } from '../../../../../../../core/modal/modal.service';
import {
  ConfirmData,
  ConfirmModal,
} from '../../../../../../../core/modal/confirm-modal/confirm-modal';
import { PresencePill } from '../../../../../components/presence-pill/presence-pill';
import { RenameEdgeModal } from '../rename-edge-modal/rename-edge-modal';

/**
 * The registered edge device as a standalone dark hero card: gateway icon and
 * identity (with an inline rename pencil) filling the left column, live
 * connectivity stacked over the activate/deactivate command on the right.
 * Activation lifecycle has no separate badge here — presence is the only
 * status shown, since the gateway relays readings but produces none itself.
 */
@Component({
  selector: 'app-edge-device-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe, PresencePill],
  template: `
    <div
      class="relative grid items-center gap-6 overflow-hidden rounded-2xl p-6"
      style="background: linear-gradient(135deg, #0E3B63 0%, #14507f 100%); grid-template-columns: minmax(0, 1fr) auto"
    >
      <div
        class="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full"
        style="background: radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, transparent 70%)"
        aria-hidden="true"
      ></div>

      <div
        class="relative grid h-full items-center gap-5"
        style="grid-template-columns: auto minmax(0, 1fr)"
      >
        <span
          class="grid h-16 w-16 place-items-center self-center rounded-2xl bg-white/10"
          aria-hidden="true"
        >
          <svg
            class="h-9 w-9 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="5" width="18" height="6" rx="2" />
            <rect x="3" y="13" width="18" height="6" rx="2" />
            <path d="M7 8h.01M7 16h.01M11 8h4M11 16h4" />
          </svg>
        </span>
        <div class="grid gap-1">
          <div class="grid grid-flow-col items-center justify-start gap-2">
            <p class="truncate text-xl font-semibold text-white">{{ device().name }}</p>
            @if (canManage()) {
              <button
                type="button"
                (click)="rename()"
                [disabled]="saving()"
                [title]="'security.edge.actions.rename' | transloco"
                [attr.aria-label]="'security.edge.actions.rename' | transloco"
                class="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                <svg
                  class="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 3 21.5l1-4.5L17 3Z" />
                </svg>
              </button>
            }
          </div>
          <p class="truncate text-sm text-white/60">
            {{ 'security.edge.code' | transloco }}: {{ device().code }}
          </p>
        </div>
      </div>

      <div class="relative grid content-center justify-items-end gap-3">
        <app-presence-pill [presence]="presence()" [dark]="true" />

        @if (canManage()) {
          <div class="grid grid-flow-col gap-2">
            <button
              type="button"
              (click)="toggleStatus()"
              [disabled]="saving()"
              class="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/10 disabled:opacity-50"
              [style.border-color]="active() ? 'rgba(248,113,113,0.5)' : 'rgba(52,211,153,0.5)'"
              [style.color]="active() ? '#fecaca' : '#a7f3d0'"
            >
              {{
                (active() ? 'security.edge.actions.deactivate' : 'security.edge.actions.activate')
                  | transloco
              }}
            </button>
          </div>
        }
      </div>
    </div>
  `,
})
export class EdgeDeviceCard {
  readonly device = input.required<EdgeDeviceResponse>();

  private readonly edgeService = inject(EdgeDeviceService);
  private readonly presenceService = inject(DevicePresenceService);
  private readonly permissions = inject(PermissionService);
  private readonly modal = inject(ModalService);
  private readonly transloco = inject(TranslocoService);

  protected readonly saving = this.edgeService.saving;

  /** Connectivity of the gateway, if it ever reported presence. */
  protected readonly presence = computed(
    () => this.presenceService.byCode().get(this.device().code) ?? null,
  );

  /** Managing the edge device requires lieutenant. */
  protected readonly canManage = computed(() => this.permissions.has('security', 'lieutenant'));

  protected readonly active = computed(() => this.device().status === 'active');

  protected rename(): void {
    this.modal.open(RenameEdgeModal, {
      title: this.transloco.translate('security.edge.rename.title'),
      data: this.device(),
    });
  }

  /** Sends the activate/deactivate command; deactivation asks first. */
  protected async toggleStatus(): Promise<void> {
    const device = this.device();
    const next = this.active() ? 'inactive' : 'active';

    if (next === 'inactive') {
      const data: ConfirmData = {
        message: this.transloco.translate('security.edge.actions.deactivate_confirm', {
          name: device.name,
        }),
        confirmLabel: this.transloco.translate('security.edge.actions.deactivate'),
        destructive: true,
      };
      const confirmed = await this.modal.open<boolean, ConfirmData>(ConfirmModal, {
        title: this.transloco.translate('security.edge.actions.deactivate_title'),
        data,
      }).closed;
      if (!confirmed) return;
    }

    await this.edgeService.update(device.id, { status: next });
  }
}
