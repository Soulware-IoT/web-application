import { Injectable, signal } from '@angular/core';
import { createClient, Session, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly client: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseKey,
    {
      auth: {
        flowType: 'pkce',
        persistSession: true,
        autoRefreshToken: true,
        // Lo manejamos manualmente en AuthCallback para poder reenviar al
        // deep link de mobile antes de consumir el code en la web.
        detectSessionInUrl: false,
      },
    },
  );

  readonly session = signal<Session | null>(null);

  constructor() {
    this.client.auth.getSession().then(({ data }) => {
      this.session.set(data.session);
    });

    this.client.auth.onAuthStateChange((_event, session) => {
      this.session.set(session);
    });
  }

  get supabase(): SupabaseClient {
    return this.client;
  }
}
