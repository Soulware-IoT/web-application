import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-toast-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toast-host.html',
})
export class ToastHost {
  private readonly notifications = inject(NotificationService);

  protected readonly toasts = this.notifications.toasts;

  protected dismiss(id: number): void {
    this.notifications.dismiss(id);
  }
}
