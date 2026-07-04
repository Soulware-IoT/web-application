import { Injectable, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { OrganizationService } from './organization.service';
import { OrganizationMemberResponse } from '../models/organization-member.model';

/** Members of the active organization, reloaded whenever the active org changes. */
@Injectable({ providedIn: 'root' })
export class OrganizationMemberService {
  private readonly http = inject(HttpClient);
  private readonly organizations = inject(OrganizationService);

  readonly members = signal<OrganizationMemberResponse[]>([]);
  readonly loading = signal(false);

  private loadedOrgId: string | null = null;

  constructor() {
    effect(() => {
      const org = this.organizations.activeOrg();

      if (!org) {
        this.loadedOrgId = null;
        this.members.set([]);
        return;
      }
      if (org.id === this.loadedOrgId) return;

      this.loadedOrgId = org.id;
      this.load(org.id);
    });
  }

  private load(orgId: string): void {
    this.loading.set(true);
    this.http
      .get<OrganizationMemberResponse[]>(`${environment.apiUrl}/organizations/${orgId}/members`)
      .subscribe({
        next: (members) => {
          this.members.set(members);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('[OrganizationMemberService] failed to load members', err);
          this.members.set([]);
          this.loading.set(false);
          this.loadedOrgId = null;
        },
      });
  }
}
