import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

export const guestGuard: CanActivateFn = async () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  if (supabase.session()) return router.createUrlTree(['/app']);

  const { data } = await supabase.supabase.auth.getSession();
  if (data.session) return router.createUrlTree(['/app']);

  return true;
};
