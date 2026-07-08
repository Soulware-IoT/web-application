import { Routes } from '@angular/router';

export const securityRoutes: Routes = [
  {
    path: '',
    redirectTo: 'management',
    pathMatch: 'full',
  },
  {
    path: 'management',
    loadComponent: () => import('./management/management').then((m) => m.Management),
  },
  {
    path: 'readings',
    loadComponent: () => import('./readings/readings').then((m) => m.Readings),
  },
];
