import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-google-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './google-button.html',
})
export class GoogleButton {
  /** Función de Supabase a ejecutar al hacer click (ej: signInWithOAuth). */
  readonly action = input.required<() => Promise<void>>();
  readonly label = input('Continuar con Google');

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
