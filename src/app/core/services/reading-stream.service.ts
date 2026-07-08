import { Injectable, effect, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { OrganizationService } from './organization.service';
import { SupabaseService } from './supabase.service';
import { consumeSse } from './sse-client';
import { Reading } from '../models/reading.model';

export type ReadingStreamStatus = 'idle' | 'connecting' | 'live' | 'reconnecting';

/** Delay before re-opening the stream after it drops. */
const RETRY_DELAY_MS = 5_000;

/** Readings kept per device for charting (~10 min at one reading every 5 s). */
const HISTORY_LIMIT = 120;

/**
 * Live sensor readings for the active organization, streamed from the SSE
 * endpoint `GET /organizations/{id}/readings/stream`.
 *
 * Connections are reference-counted: views call `connect()` while visible and
 * `disconnect()` on destroy, so the socket only lives while someone watches.
 */
@Injectable({ providedIn: 'root' })
export class ReadingStreamService {
  private readonly orgService = inject(OrganizationService);
  private readonly supabase = inject(SupabaseService);

  /** Latest reading per device code; cleared when the active org changes. */
  readonly latestByCode = signal<ReadonlyMap<string, Reading>>(new Map());
  /** Rolling window of recent readings per device code, oldest first. */
  readonly historyByCode = signal<ReadonlyMap<string, readonly Reading[]>>(new Map());
  readonly status = signal<ReadingStreamStatus>('idle');

  private consumers = 0;
  private streamOrgId: string | null = null;
  private abort: AbortController | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Drop the stream and its data whenever the active organization changes.
    effect(() => {
      const orgId = this.orgService.activeOrg()?.id ?? null;
      if (orgId === this.streamOrgId) return;

      this.streamOrgId = orgId;
      this.latestByCode.set(new Map());
      this.historyByCode.set(new Map());
      this.stop();
      if (this.consumers > 0 && orgId) {
        this.open(orgId);
      } else {
        this.status.set('idle');
      }
    });
  }

  /** Registers a consumer; opens the stream on the first one. */
  connect(): void {
    this.consumers++;
    if (this.consumers === 1 && this.streamOrgId && !this.abort) {
      this.open(this.streamOrgId);
    }
  }

  /** Releases a consumer; closes the stream when none remain. */
  disconnect(): void {
    this.consumers = Math.max(0, this.consumers - 1);
    if (this.consumers === 0) {
      this.stop();
      this.status.set('idle');
    }
  }

  private async open(orgId: string): Promise<void> {
    this.stop();
    const abort = new AbortController();
    this.abort = abort;
    if (this.status() !== 'reconnecting') this.status.set('connecting');

    try {
      const token = this.supabase.session()?.access_token;
      await consumeSse(
        `${environment.apiUrl}/organizations/${orgId}/readings/stream`,
        token,
        abort.signal,
        (data) => this.apply(data),
        () => this.status.set('live'),
      );
    } catch (err) {
      if (abort.signal.aborted) return; // closed on purpose
      console.error('[ReadingStreamService] stream dropped', err);
    }

    if (abort.signal.aborted) return;
    this.scheduleRetry(orgId);
  }

  private apply(data: unknown): void {
    const reading = data as Reading;
    if (!reading?.deviceCode) return;
    this.latestByCode.update((map) => {
      const next = new Map(map);
      next.set(reading.deviceCode, reading);
      return next;
    });
    this.historyByCode.update((map) => {
      const next = new Map(map);
      const series = [...(next.get(reading.deviceCode) ?? []), reading];
      next.set(reading.deviceCode, series.slice(-HISTORY_LIMIT));
      return next;
    });
  }

  private scheduleRetry(orgId: string): void {
    this.status.set('reconnecting');
    this.retryTimer = setTimeout(() => {
      if (this.consumers > 0 && this.streamOrgId === orgId) {
        this.open(orgId);
      }
    }, RETRY_DELAY_MS);
  }

  private stop(): void {
    if (this.retryTimer !== null) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    this.abort?.abort();
    this.abort = null;
  }
}
