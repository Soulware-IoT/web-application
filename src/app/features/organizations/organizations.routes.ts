import { Routes } from '@angular/router';

/** Sub-views rendered inside the organization layout (tabs). */
export const organizationsRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'overview',
  },
  {
    path: 'overview',
    loadComponent: () => import('./overview/overview').then((m) => m.Overview),
  },
  {
    path: 'subscription',
    loadComponent: () =>
      import('./manage-subscription/manage-subscription').then((m) => m.ManageSubscription),
  },
  {
    path: 'invitations',
    loadComponent: () => import('./invitations/invitations').then((m) => m.Invitations),
  },
  {
    path: 'members',
    loadComponent: () => import('./members/members').then((m) => m.Members),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./members/components/member-permissions-panel/member-permissions-panel').then(
            (m) => m.MemberPermissionsPanel,
          ),
      },
      {
        path: ':memberId',
        loadComponent: () =>
          import('./members/components/member-permissions-panel/member-permissions-panel').then(
            (m) => m.MemberPermissionsPanel,
          ),
      },
    ],
  },
];
