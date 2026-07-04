import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  ControlFormatResponse,
  FieldInput,
  LifecycleActionName,
} from '../models/control-format.model';
import { NotificationService, httpErrorMessage } from '../notifications/notification.service';

const TRANSITION_MESSAGE: Record<LifecycleActionName, string> = {
  activate: 'Formato activado',
  suspend: 'Formato suspendido',
  resume: 'Formato reanudado',
  cease: 'Formato cesado',
};

@Injectable({ providedIn: 'root' })
export class ControlFormatService {
  private readonly http = inject(HttpClient);
  private readonly notifications = inject(NotificationService);

  /** Formats already fetched, keyed by their parent process id. */
  readonly formatsByProcess = signal<Record<string, ControlFormatResponse[]>>({});
  /** Process ids whose formats are currently being fetched. */
  readonly loadingProcessIds = signal<ReadonlySet<string>>(new Set());
  /** The format shown in the detail pane on the right. */
  readonly format = signal<ControlFormatResponse | null>(null);
  /** True while the detail pane's format is being fetched. */
  readonly formatLoading = signal(false);

  formatsFor(processId: string): ControlFormatResponse[] | undefined {
    return this.formatsByProcess()[processId];
  }

  isLoading(processId: string): boolean {
    return this.loadingProcessIds().has(processId);
  }

  /** Lazily loads a process's formats the first time its folder is expanded. */
  loadForProcess(processId: string): void {
    if (processId in this.formatsByProcess() || this.isLoading(processId)) return;

    this.setLoading(processId, true);
    this.http
      .get<ControlFormatResponse[]>(
        `${environment.apiUrl}/control-processes/${processId}/formats`,
      )
      .subscribe({
        next: (formats) => {
          this.formatsByProcess.update((map) => ({ ...map, [processId]: formats }));
          this.setLoading(processId, false);
        },
        error: (err) => {
          console.error('[ControlFormatService] failed to load formats', err);
          this.formatsByProcess.update((map) => ({ ...map, [processId]: [] }));
          this.setLoading(processId, false);
        },
      });
  }

  /** Creates a format under a process and appends it to the cached list. */
  create(
    processId: string,
    name: string,
    createSampleFields: boolean,
  ): Promise<ControlFormatResponse | null> {
    return new Promise((resolve) => {
      this.http
        .post<ControlFormatResponse>(
          `${environment.apiUrl}/control-processes/${processId}/formats`,
          { name, createSampleFields },
        )
        .subscribe({
          next: (format) => {
            this.formatsByProcess.update((map) => ({
              ...map,
              [processId]: [...(map[processId] ?? []), format],
            }));
            this.notifications.success('Formato creado');
            resolve(format);
          },
          error: (err) => {
            console.error('[ControlFormatService] failed to create format', err);
            this.notifications.error(httpErrorMessage(err));
            resolve(null);
          },
        });
    });
  }

  /**
   * Replaces the format's fields wholesale (draft only). The UI assembles the
   * complete valid state and sends it as a single PUT.
   */
  replaceFields(formatId: string, fields: FieldInput[]): Promise<ControlFormatResponse | null> {
    return new Promise((resolve) => {
      this.http
        .put<ControlFormatResponse>(`${environment.apiUrl}/formats/${formatId}/fields`, { fields })
        .subscribe({
          next: (updated) => {
            this.format.set(updated);
            this.formatsByProcess.update((map) => {
              const list = map[updated.processId];
              if (!list) return map;
              return {
                ...map,
                [updated.processId]: list.map((f) => (f.id === updated.id ? updated : f)),
              };
            });
            this.notifications.success('Campos guardados');
            resolve(updated);
          },
          error: (err) => {
            console.error('[ControlFormatService] failed to replace fields', err);
            this.notifications.error(httpErrorMessage(err));
            resolve(null);
          },
        });
    });
  }

  /**
   * Runs a lifecycle transition (activate/suspend/resume/cease) and reflects
   * the new status in both the detail pane and the cached sidebar list.
   */
  transition(id: string, action: LifecycleActionName): Promise<ControlFormatResponse | null> {
    return new Promise((resolve) => {
      this.http
        .post<ControlFormatResponse>(`${environment.apiUrl}/formats/${id}/${action}`, {})
        .subscribe({
          next: (updated) => {
            this.format.set(updated);
            this.formatsByProcess.update((map) => {
              const list = map[updated.processId];
              if (!list) return map;
              return {
                ...map,
                [updated.processId]: list.map((f) => (f.id === updated.id ? updated : f)),
              };
            });
            this.notifications.success(TRANSITION_MESSAGE[action]);
            resolve(updated);
          },
          error: (err) => {
            console.error('[ControlFormatService] failed to transition format', err);
            this.notifications.error(httpErrorMessage(err));
            resolve(null);
          },
        });
    });
  }

  /** Loads a single format for the detail pane (also covers deep links). */
  loadDetail(id: string): void {
    this.formatLoading.set(true);
    this.http.get<ControlFormatResponse>(`${environment.apiUrl}/formats/${id}`).subscribe({
      next: (format) => {
        this.format.set(format);
        this.formatLoading.set(false);
      },
      error: (err) => {
        console.error('[ControlFormatService] failed to load format detail', err);
        this.format.set(null);
        this.formatLoading.set(false);
      },
    });
  }

  private setLoading(processId: string, value: boolean): void {
    this.loadingProcessIds.update((set) => {
      const next = new Set(set);
      value ? next.add(processId) : next.delete(processId);
      return next;
    });
  }
}
