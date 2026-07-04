import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  ControlRegistryResponse,
  CreateControlRegistryRequest,
} from '../models/control-registry.model';
import { NotificationService, httpErrorMessage } from '../notifications/notification.service';

@Injectable({ providedIn: 'root' })
export class ControlRegistryService {
  private readonly http = inject(HttpClient);
  private readonly notifications = inject(NotificationService);

  /** Registries already fetched, keyed by their parent format id. */
  readonly registriesByFormat = signal<Record<string, ControlRegistryResponse[]>>({});
  /** Format ids whose registries are currently being fetched. */
  readonly loadingFormatIds = signal<ReadonlySet<string>>(new Set());

  registriesFor(formatId: string): ControlRegistryResponse[] | undefined {
    return this.registriesByFormat()[formatId];
  }

  isLoading(formatId: string): boolean {
    return this.loadingFormatIds().has(formatId);
  }

  /** Loads a format's registries the first time its grid is shown. */
  loadForFormat(formatId: string): void {
    if (formatId in this.registriesByFormat() || this.isLoading(formatId)) return;

    this.setLoading(formatId, true);
    this.http
      .get<ControlRegistryResponse[]>(`${environment.apiUrl}/formats/${formatId}/registries`)
      .subscribe({
        next: (registries) => {
          this.registriesByFormat.update((map) => ({ ...map, [formatId]: registries }));
          this.setLoading(formatId, false);
        },
        error: (err) => {
          console.error('[ControlRegistryService] failed to load registries', err);
          this.notifications.error(httpErrorMessage(err));
          this.registriesByFormat.update((map) => ({ ...map, [formatId]: [] }));
          this.setLoading(formatId, false);
        },
      });
  }

  /** Appends a new registry to a format (append-only) and caches it. */
  create(
    formatId: string,
    data: Record<string, unknown>,
  ): Promise<ControlRegistryResponse | null> {
    const body: CreateControlRegistryRequest = { data };
    return new Promise((resolve) => {
      this.http
        .post<ControlRegistryResponse>(
          `${environment.apiUrl}/formats/${formatId}/registries`,
          body,
        )
        .subscribe({
          next: (registry) => {
            this.registriesByFormat.update((map) => ({
              ...map,
              [formatId]: [...(map[formatId] ?? []), registry],
            }));
            this.notifications.success('Registro agregado');
            resolve(registry);
          },
          error: (err) => {
            console.error('[ControlRegistryService] failed to create registry', err);
            this.notifications.error(httpErrorMessage(err));
            resolve(null);
          },
        });
    });
  }

  private setLoading(formatId: string, value: boolean): void {
    this.loadingFormatIds.update((set) => {
      const next = new Set(set);
      value ? next.add(formatId) : next.delete(formatId);
      return next;
    });
  }
}
