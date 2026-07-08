import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { DevicePresenceService } from '../../../core/services/device-presence.service';
import { PermissionService } from '../../../core/services/permission.service';
import { EdgeDevice } from './components/edge-device/edge-device';
import { IotDevices } from './components/iot-devices/iot-devices';

/** Management tab: the org's edge device and its IoT sensors, side by side. */
@Component({
  selector: 'app-security-management',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe, EdgeDevice, IotDevices],
  template: `
    @if (!canView()) {
      <p class="text-sm" style="color: #64748b">{{ 'security.view_denied' | transloco }}</p>
    } @else {
      <div class="grid gap-6" style="align-content: start">
        <app-edge-device />
        <app-iot-devices />
      </div>
    }
  `,
})
export class Management {
  private readonly permissions = inject(PermissionService);
  private readonly presence = inject(DevicePresenceService);

  /** Seeing the devices requires at least assignee in the security context. */
  protected readonly canView = computed(() => this.permissions.has('security', 'assignee'));

  constructor() {
    // Presence feeds both panels; keep it open only while this view is on screen.
    this.presence.connect();
    inject(DestroyRef).onDestroy(() => this.presence.disconnect());
  }
}
