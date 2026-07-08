import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { EdgeDeviceService } from '../../../../../core/services/edge-device.service';
import { PermissionService } from '../../../../../core/services/permission.service';
import { EdgeClaimForm } from './components/edge-claim-form/edge-claim-form';
import { EdgeDeviceCard } from './components/edge-device-card/edge-device-card';
import { EdgeDeviceSkeleton } from './components/edge-device-skeleton/edge-device-skeleton';

/**
 * The organization's single gateway, presented as the hero of the management
 * view: a dark brand panel that visually anchors the IoT fleet below it.
 * Shows the registered device with its management actions, or the
 * registration invite when the org has none yet. Assumes the parent view
 * already gated visibility on the security context.
 */
@Component({
  selector: 'app-edge-device',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe, EdgeClaimForm, EdgeDeviceCard, EdgeDeviceSkeleton],
  template: `
    @if (loading()) {
      <app-edge-device-skeleton />
    } @else if (loadFailed()) {
      <p class="text-sm" style="color: #b91c1c">{{ 'security.edge.load_error' | transloco }}</p>
    } @else if (device(); as registered) {
      <app-edge-device-card [device]="registered" />
    } @else {
      <section
        class="relative grid gap-5 overflow-hidden rounded-2xl p-6"
        style="background: linear-gradient(135deg, #0E3B63 0%, #14507f 100%)"
      >
        <div
          class="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full"
          style="background: radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, transparent 70%)"
          aria-hidden="true"
        ></div>

        @if (canManage()) {
          <div class="relative grid gap-4 rounded-xl border border-dashed border-white/30 p-5">
            <div class="grid gap-1">
              <h3 class="text-sm font-semibold text-white">
                {{ 'security.edge.register.title' | transloco }}
              </h3>
              <p class="text-sm text-white/70">
                {{ 'security.edge.register.one_per_org' | transloco }}
              </p>
            </div>
            <app-edge-claim-form />
          </div>
        } @else {
          <p class="relative text-sm text-white/70">{{ 'security.edge.empty' | transloco }}</p>
        }
      </section>
    }
  `,
})
export class EdgeDevice {
  private readonly edgeService = inject(EdgeDeviceService);
  private readonly permissions = inject(PermissionService);

  protected readonly loading = this.edgeService.loading;
  protected readonly loadFailed = this.edgeService.loadFailed;
  protected readonly device = this.edgeService.device;

  /** Registering / managing the edge device requires lieutenant. */
  protected readonly canManage = computed(() => this.permissions.has('security', 'lieutenant'));
}
