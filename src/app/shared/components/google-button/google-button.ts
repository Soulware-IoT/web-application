import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-google-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe],
  templateUrl: './google-button.html',
})
export class GoogleButton {
  /** Función de Supabase a ejecutar al hacer click (ej: signInWithOAuth). */
  readonly action = input.required<() => Promise<void>>();

  protected readonly loading = signal(false);

  protected async run(): Promise<void> {
    if (this.loading()) return;
    this.loading.set(true);
    try {
      await this.action()();
    } finally {
      this.loading.set(false);
    }
  }
}
