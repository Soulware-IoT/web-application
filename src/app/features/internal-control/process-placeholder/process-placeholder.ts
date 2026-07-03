import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-process-placeholder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid h-full place-items-center p-8 text-center">
      <p class="text-sm" style="color: #4A4A4F">
        Abre un proceso y selecciona un formato del panel para ver su contenido.
      </p>
    </div>
  `,
})
export class ProcessPlaceholder {}
