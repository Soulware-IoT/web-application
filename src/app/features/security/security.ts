import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-security',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p class="p-8 text-sm" style="color:#4A4A4F">Security — coming soon.</p>`,
})
export class Security {}
