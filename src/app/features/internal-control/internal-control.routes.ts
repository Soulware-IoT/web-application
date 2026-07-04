import { Routes } from '@angular/router';
import { pendingChangesGuard } from '../../core/unsaved-changes/unsaved-changes.guard';

export const internalControlRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./process-placeholder/process-placeholder').then((m) => m.ProcessPlaceholder),
  },
  {
    path: 'formats/:formatId',
    loadComponent: () => import('./format-detail/format-detail').then((m) => m.FormatDetail),
    canDeactivate: [pendingChangesGuard],
  },
];
