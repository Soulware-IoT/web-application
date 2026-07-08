import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

export const authGuard: CanActivateFn = async () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  // Fast path: signal already populated (subsequent navigations).
  if (supabase.session()) return true;

  // Slow path: first load, signal not yet populated — read from storage.
  const { data } = await supabase.supabase.auth.getSession();
  if (data.session) return true;

  return router.createUrlTree(['/login']);
};
