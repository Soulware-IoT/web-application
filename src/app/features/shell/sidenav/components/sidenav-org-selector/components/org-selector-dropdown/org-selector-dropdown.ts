import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { OrganizationResponse } from '../../../../../../../core/models/organization.model';

@Component({
  selector: 'app-org-selector-dropdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './org-selector-dropdown.html',
})
export class OrgSelectorDropdown {
  readonly organizations = input.required<OrganizationResponse[] | null>();
  readonly activeOrg = input.required<OrganizationResponse | null>();
  readonly orgSelected = output<OrganizationResponse>();
  readonly createClicked = output<void>();

  protected readonly isEmpty = computed(() => this.organizations()?.length === 0);

  protected initial(name: string): string {
    return name.trim().charAt(0).toUpperCase() || '?';
  }
}
