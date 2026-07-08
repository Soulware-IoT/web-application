import { Injectable, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SupabaseService } from './supabase.service';
import { Address, OrganizationResponse } from '../models/organization.model';

export interface UpdateOrganizationRequest {
  name: string;
  address?: Address;
}

export interface CreateOrganizationRequest {
  name: string;
  address?: Address;
}

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private readonly http = inject(HttpClient);
  private readonly supabase = inject(SupabaseService);

  private static readonly ACTIVE_KEY = 'pidemas.activeOrgId';

  readonly organizations = signal<OrganizationResponse[] | null>(null);
  readonly activeOrg = signal<OrganizationResponse | null>(null);
  readonly loading = signal(true);

  private loaded = false;

  constructor() {
    effect(() => {
      const loggedIn = !!this.supabase.session()?.user?.id;
      if (loggedIn && !this.loaded) {
        this.loaded = true;
        this.loading.set(true);
        this.load();
      }
      if (!loggedIn) {
        this.loaded = false;
        this.loading.set(true);
        this.organizations.set(null);
        this.activeOrg.set(null);
      }
    });
  }

  setActive(org: OrganizationResponse): void {
    this.activeOrg.set(org);
    localStorage.setItem(OrganizationService.ACTIVE_KEY, org.id);
  }

  /** Creates an organization, appends it to the list, and makes it the active org. */
  create(request: CreateOrganizationRequest) {
    return this.http
      .post<OrganizationResponse>(`${environment.apiUrl}/organizations`, request)
      .pipe(
        tap((created) => {
          this.organizations.update((list) => (list ? [...list, created] : [created]));
          this.setActive(created);
        }),
      );
  }

  /** Updates an organization and reflects the server's response in the active org and list. */
  update(id: string, request: UpdateOrganizationRequest) {
    return this.http
      .patch<OrganizationResponse>(`${environment.apiUrl}/organizations/${id}`, request)
      .pipe(
        tap((updated) => {
          this.organizations.update((list) =>
            list?.map((o) => (o.id === id ? updated : o)) ?? list,
          );
          if (this.activeOrg()?.id === id) this.activeOrg.set(updated);
        }),
      );
  }

  private load(): void {
    this.loading.set(true);
    this.http
      .get<OrganizationResponse[]>(`${environment.apiUrl}/organizations`)
      .subscribe({
        next: (orgs) => {
          this.organizations.set(orgs);
          this.activeOrg.set(this.resolveActive(orgs));
          this.loading.set(false);
        },
        error: (err) => {
          console.error('[OrganizationService] failed to load organizations', err);
          this.organizations.set([]);
          this.activeOrg.set(null);
          this.loading.set(false);
          this.loaded = false;
        },
      });
  }

  private resolveActive(orgs: OrganizationResponse[]): OrganizationResponse | null {
    if (!orgs.length) return null;
    const savedId = localStorage.getItem(OrganizationService.ACTIVE_KEY);
    return orgs.find((o) => o.id === savedId) ?? orgs[0];
  }
}
