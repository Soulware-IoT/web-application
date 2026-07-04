import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { OrganizationService } from '../../../../../core/services/organization.service';
import { OrganizationResponse } from '../../../../../core/models/organization.model';
import { OrgSelectorTrigger } from './components/org-selector-trigger/org-selector-trigger';
import { OrgSelectorDropdown } from './components/org-selector-dropdown/org-selector-dropdown';

@Component({
  selector: 'app-sidenav-org-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OrgSelectorTrigger, OrgSelectorDropdown],
  templateUrl: './sidenav-org-selector.html',
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'close()',
  },
})
export class SidenavOrgSelector {
  private readonly orgService = inject(OrganizationService);
  private readonly host = inject(ElementRef);
  private readonly router = inject(Router);

  protected readonly organizations = this.orgService.organizations;
  protected readonly activeOrg = this.orgService.activeOrg;
  protected readonly open = signal(false);

  protected readonly isLoading = computed(
    () => this.orgService.loading() && this.organizations() === null,
  );

  protected toggle(): void {
    this.open.update((v) => !v);
  }

  protected close(): void {
    this.open.set(false);
  }

  protected select(org: OrganizationResponse): void {
    this.orgService.setActive(org);
    this.close();
  }

  protected createOrganization(): void {
    this.close();
    this.router.navigateByUrl('/app/organizations/new');
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}
