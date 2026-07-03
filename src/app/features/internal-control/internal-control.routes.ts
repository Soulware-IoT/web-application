import { Routes } from '@angular/router';

export const internalControlRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./process-placeholder/process-placeholder').then((m) => m.ProcessPlaceholder),
  },
  {
    path: ':processId',
    loadComponent: () =>
      import('./process-detail/process-detail').then((m) => m.ProcessDetail),
  },
];
