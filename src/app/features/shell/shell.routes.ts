import { Routes } from '@angular/router';

export const shellRoutes: Routes = [
  {
    path: '',
    redirectTo: 'organizations',
    pathMatch: 'full',
  },
  {
    // Must precede the `organizations` layout route, whose children would
    // otherwise swallow the `new` segment.
    path: 'organizations/new',
    loadComponent: () =>
      import('../organizations/create-organization/create-organization').then(
        (m) => m.CreateOrganization,
      ),
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
  },
];