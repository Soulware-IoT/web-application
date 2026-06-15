import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },
  {
    path: 'auth-callback',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/auth-callback/auth-callback').then((m) => m.AuthCallback),
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () => import('./features/shell/shell').then((m) => m.Shell),
    loadChildren: () => import('./features/shell/shell.routes').then((m) => m.shellRoutes),
  },
  {
    path: '',
    redirectTo: 'app',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'app',
  },
];
