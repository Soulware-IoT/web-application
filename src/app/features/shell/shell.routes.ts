import { Routes } from '@angular/router';

export const shellRoutes: Routes = [
  {
    path: '',
    redirectTo: 'organizations',
    pathMatch: 'full',
  },
  {
    path: 'organizations',
    loadComponent: () => import('../organizations/organizations').then((m) => m.Organizations),
  },
  {
    path: 'organizations/new',
    loadComponent: () =>
      import('../organizations/create-organization/create-organization').then(
        (m) => m.CreateOrganization,
      ),
  },
  {
    path: 'internal-control',
    loadComponent: () => import('../internal-control/internal-control').then((m) => m.InternalControl),
    loadChildren: () =>
      import('../internal-control/internal-control.routes').then((m) => m.internalControlRoutes),
  },
  {
    path: 'security',
    loadComponent: () => import('../security/security').then((m) => m.Security),
  },
];