import { Injectable, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrganizationService } from './organization.service';
import { SupabaseService } from './supabase.service';
import { consumeSse } from './sse-client';
import { DevicePresenceResponse } from '../models/device-presence.model';

/** Delay before re-opening the stream after it drops. */
const RETRY_DELAY_MS = 5_000;

/**
 * Online/offline connectivity of the active organization's devices (edge and
 * IoT alike) — orthogonal to their activation lifecycle. On each (re)connect
 * it loads the snapshot endpoint, then merges live updates from the SSE
 * stream, so the map can never go stale across reconnects.
 *
 * Connections are reference-counted: views call `connect()` while visible and
 * `disconnect()` on destroy, so the socket only lives while someone watches.
 */
@Injectable({ providedIn: 'root' })
export class DevicePresenceService {
  private readonly http = inject(HttpClient);
  private readonly orgService = inject(OrganizationService);
  private readonly supabase = inject(SupabaseService);

  /** Presence per device code; cleared when the active org changes. */
  readonly byCode = signal<ReadonlyMap<string, DevicePresenceResponse>>(new Map());

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
      this.byCode.set(new Map());
      this.stop();
      if (this.consumers > 0 && orgId) {
        this.open(orgId);
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
    if (this.consumers === 0) this.stop();
  }

  private async open(orgId: string): Promise<void> {
    this.stop();
    const abort = new AbortController();
    this.abort = abort;

    try {
      const snapshot = await firstValueFrom(
        this.http.get<DevicePresenceResponse[]>(
          `${environment.apiUrl}/organizations/${orgId}/devices/presence`,
        ),
      );
      if (abort.signal.aborted) return;
      this.byCode.set(new Map(snapshot.map((p) => [p.deviceCode, p])));

      const token = this.supabase.session()?.access_token;
      await consumeSse(
        `${environment.apiUrl}/organizations/${orgId}/devices/presence/stream`,
        token,
        abort.signal,
        (data) => this.apply(data),
      );
    } catch (err) {
      if (abort.signal.aborted) return; // closed on purpose
      console.error('[DevicePresenceService] presence stream dropped', err);
    }

    if (abort.signal.aborted) return;
    this.scheduleRetry(orgId);
  }

  private apply(data: unknown): void {
    const presence = data as DevicePresenceResponse;
    if (!presence?.deviceCode) return;
    this.byCode.update((map) => {
      const next = new Map(map);
      next.set(presence.deviceCode, presence);
      return next;
    });
  }

  private scheduleRetry(orgId: string): void {
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
