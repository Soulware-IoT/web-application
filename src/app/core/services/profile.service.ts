import { Injectable, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SupabaseService } from './supabase.service';
import { ProfileResponse } from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly supabase = inject(SupabaseService);

  readonly profile = signal<ProfileResponse | null>(null);
  readonly loading = signal(true);

  private loadedId: string | null = null;

  constructor() {
    effect(() => {
      const userId = this.supabase.session()?.user?.id ?? null;

      if (userId && userId !== this.loadedId) {
        this.loadedId = userId;
        this.loading.set(true);
        this.fetchById(userId);
      }

      if (!userId) {
        this.loadedId = null;
        this.loading.set(true);
        this.profile.set(null);
      }
    });
  }

  private fetchById(id: string): void {
    this.http.get<ProfileResponse>(`${environment.apiUrl}/profiles/${id}`).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('[ProfileService] failed to load profile', err);
        this.loadedId = null;
        this.loading.set(false);
      },
    });
  }
}
