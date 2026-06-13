import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

export const authGuard: CanActivateFn = () => {
  const session = inject(SupabaseService).session;
  const router = inject(Router);

  if (session()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
