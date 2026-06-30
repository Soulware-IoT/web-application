import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { OrganizationResponse } from '../../../../../../../core/models/organization.model';

@Component({
  selector: 'app-org-selector-trigger',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './org-selector-trigger.html',
})
export class OrgSelectorTrigger {
  readonly isLoading = input.required<boolean>();
  readonly open = input.required<boolean>();
  readonly activeOrg = input.required<OrganizationResponse | null>();
  readonly toggled = output<void>();

  protected initial(name: string): string {
    return name.trim().charAt(0).toUpperCase() || '?';
  }
}
