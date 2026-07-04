import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-create-organization',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p class="p-8 text-sm" style="color:#4A4A4F">Create organization — coming soon.</p>`,
})
export class CreateOrganization {}
