import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { UnsavedChangesService } from './unsaved-changes.service';

/**
 * Blocks leaving a route while an editor reports unsaved changes, prompting the
 * user first. Covers exits that destroy the component (other features, the
 * placeholder). Same-route param changes (e.g. format → format) don't trigger
 * CanDeactivate and are handled inside the component instead.
 */
export const pendingChangesGuard: CanDeactivateFn<unknown> = () =>
  inject(UnsavedChangesService).confirm();
