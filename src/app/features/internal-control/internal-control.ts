import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-internal-control',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p class="p-8 text-sm" style="color:#4A4A4F">Internal Control — coming soon.</p>`,
})
export class InternalControl {}
