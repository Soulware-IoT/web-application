import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-organizations',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p class="p-8 text-sm" style="color:#4A4A4F">Organizations — coming soon.</p>`,
})
export class Organizations {}
