import { Routes } from '@angular/router';

export const internalControlRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./process-placeholder/process-placeholder').then((m) => m.ProcessPlaceholder),
  },
  {
    path: 'formats/:formatId',
    loadComponent: () => import('./format-detail/format-detail').then((m) => m.FormatDetail),
  },
];
