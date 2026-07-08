import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-process-placeholder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe],
  template: `
    <div class="grid h-full place-items-center p-8 text-center">
      <p class="text-sm" style="color: #4A4A4F">{{ 'internalControl.placeholder' | transloco }}</p>
    </div>
  `,
})
export class ProcessPlaceholder {}
