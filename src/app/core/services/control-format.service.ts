import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ControlFormatResponse } from '../models/control-format.model';

@Injectable({ providedIn: 'root' })
export class ControlFormatService {
  private readonly http = inject(HttpClient);

  /** Formats already fetched, keyed by their parent process id. */
  readonly formatsByProcess = signal<Record<string, ControlFormatResponse[]>>({});
  /** Process ids whose formats are currently being fetched. */
  readonly loadingProcessIds = signal<ReadonlySet<string>>(new Set());
  /** The format shown in the detail pane on the right. */
  readonly format = signal<ControlFormatResponse | null>(null);

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
            resolve(format);
          },
          error: (err) => {
            console.error('[ControlFormatService] failed to create format', err);
            resolve(null);
          },
        });
    });
  }

  /**
   * Runs a lifecycle transition (activate/suspend/resume/cease) and reflects
   * the new status in both the detail pane and the cached sidebar list.
   */
  transition(id: string, action: string): Promise<ControlFormatResponse | null> {
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
            resolve(updated);
          },
          error: (err) => {
            console.error('[ControlFormatService] failed to transition format', err);
            resolve(null);
          },
        });
    });
  }

  /** Loads a single format for the detail pane (also covers deep links). */
  loadDetail(id: string): void {
    this.http.get<ControlFormatResponse>(`${environment.apiUrl}/formats/${id}`).subscribe({
      next: (format) => this.format.set(format),
      error: (err) => {
        console.error('[ControlFormatService] failed to load format detail', err);
        this.format.set(null);
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
