import { Routes } from '@angular/router';

export const shellRoutes: Routes = [
  {
    path: '',
    redirectTo: 'organizations',
    pathMatch: 'full',
  },
  {
    path: 'organizations',
    loadComponent: () =>
      import('../organizations/organization-layout/organization-layout').then(
        (m) => m.OrganizationLayout,
      ),
    loadChildren: () =>
      import('../organizations/organizations.routes').then((m) => m.organizationsRoutes),
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
    loadChildren: () => import('../security/security.routes').then((m) => m.securityRoutes),
  },
];