import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ServoCommand } from '../../../../core/models/iot-device.model';
import { IoTDeviceService } from '../../../../core/services/iot-device.service';

/**
 * Icon pair firing the device's servo actuator: play = start, square = stop.
 * Any viewer may operate the servo; labels live in the tooltip and aria-label.
 */
@Component({
  selector: 'app-servo-controls',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe],
  template: `
    <div class="grid grid-flow-col gap-1.5">
      <button
        type="button"
        (click)="servo('start')"
        [disabled]="servoing()"
        [title]="'security.iot.servo.start' | transloco"
        [attr.aria-label]="'security.iot.servo.start' | transloco"
        class="grid h-8 w-8 place-items-center rounded-lg border transition-colors hover:bg-emerald-50 disabled:opacity-50"
        style="border-color: #a7f3d0; color: #047857"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8 5.5a1 1 0 0 1 1.54-.84l10 6.5a1 1 0 0 1 0 1.68l-10 6.5A1 1 0 0 1 8 18.5v-13Z" />
        </svg>
      </button>
      <button
        type="button"
        (click)="servo('stop')"
        [disabled]="servoing()"
        [title]="'security.iot.servo.stop' | transloco"
        [attr.aria-label]="'security.iot.servo.stop' | transloco"
        class="grid h-8 w-8 place-items-center rounded-lg border transition-colors hover:bg-amber-50 disabled:opacity-50"
        style="border-color: #fde68a; color: #b45309"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      </button>
    </div>
  `,
})
export class ServoControls {
  readonly deviceId = input.required<string>();

  private readonly deviceService = inject(IoTDeviceService);

  protected readonly servoing = computed(
    () => this.deviceService.servoingId() === this.deviceId(),
  );

  protected async servo(command: ServoCommand): Promise<void> {
    await this.deviceService.servo(this.deviceId(), command);
  }
}
