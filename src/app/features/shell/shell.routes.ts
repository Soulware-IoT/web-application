import { Routes } from '@angular/router';

export const shellRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () => import('../dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'internal-control',
    loadComponent: () => import('../internal-control/internal-control').then((m) => m.InternalControl),
  },
  {
    path: 'security',
    loadComponent: () => import('../security/security').then((m) => m.Security),
  },
];