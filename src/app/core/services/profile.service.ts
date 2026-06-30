import { Injectable, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SupabaseService } from './supabase.service';
import { ProfileResponse } from '../models/profile.model';

/// Resolves and holds the current user's backend profile. The profile id equals
/// the Supabase user id (`sub`) — the same value the gateway stamps as
/// `X-Requester-Id` — so we fetch it directly by id, no email round-trip.
@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly supabase = inject(SupabaseService);

  /// The current user's profile, or `null` until the first successful fetch.
  readonly profile = signal<ProfileResponse | null>(null);

  private loadedId: string | null = null;

  constructor() {
    effect(() => {
      const userId = this.supabase.session()?.user?.id ?? null;
      if (userId && userId !== this.loadedId) {
        this.loadedId = userId;
        this.fetchById(userId);
      }
    });
  }

  private fetchById(id: string): void {
    this.http.get<ProfileResponse>(`${environment.apiUrl}/profiles/${id}`).subscribe({
      next: (profile) => this.profile.set(profile),
      error: (err) => {
        console.error('[ProfileService] failed to load profile', err);
        this.loadedId = null;
      },
    });
  }
}
