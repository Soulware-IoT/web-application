import { Injectable, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SupabaseService } from './supabase.service';
import { ProfileResponse } from '../models/profile.model';

/// Resolves and holds the current user's backend profile, keyed by the email of
/// the active Supabase session. Singleton so every consumer (sidenav, settings,
/// future screens) reads the same `profile` signal.
@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly supabase = inject(SupabaseService);

  /// The current user's profile, or `null` until the first successful fetch.
  readonly profile = signal<ProfileResponse | null>(null);

  /// The email we already resolved, so the effect doesn't refetch on every
  /// unrelated session change. Reset on error to allow a retry.
  private loadedEmail: string | null = null;

  constructor() {
    effect(() => {
      const email = this.supabase.session()?.user?.email ?? null;
      if (email && email !== this.loadedEmail) {
        this.loadedEmail = email;
        this.fetchByEmail(email);
      }
    });
  }

  private fetchByEmail(email: string): void {
    this.http
      .get<ProfileResponse>(`${environment.apiUrl}/profiles`, { params: { email } })
      .subscribe({
        next: (profile) => this.profile.set(profile),
        error: () => {
          this.loadedEmail = null;
        },
      });
  }
}
