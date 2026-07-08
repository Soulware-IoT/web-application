import { Injectable, effect, inject, signal } from '@angular/core';
import { ModalService } from '../modal/modal.service';
import { ConfirmModal, ConfirmData } from '../modal/confirm-modal/confirm-modal';

/**
 * Single source of truth for "the user has edits that aren't persisted yet".
 *
 * Editors push their dirty state here; navigation guards and in-component param
 * interceptors call `confirm()` before discarding those edits. Keeping it in one
 * service means every exit path — route change, format switch, tab close —
 * funnels through the same prompt.
 */
@Injectable({ providedIn: 'root' })
export class UnsavedChangesService {
  private readonly modal = inject(ModalService);

  private readonly dirty = signal(false);
  readonly isDirty = this.dirty.asReadonly();

  /** In-flight prompt, shared so overlapping exit checks reuse one modal. */
  private pending: Promise<boolean> | null = null;

  constructor() {
    // Tab close / refresh can't show our modal — fall back to the native prompt,
    // toggled purely off the dirty state.
    effect(() => {
      if (typeof window === 'undefined') return;
      window.onbeforeunload = this.dirty()
        ? (event: BeforeUnloadEvent) => {
            event.preventDefault();
            return '';
          }
        : null;
    });
  }

  /** Called by editors to publish whether they hold unsaved edits. */
  setDirty(value: boolean): void {
    this.dirty.set(value);
  }

  /**
   * Resolves `true` when it's safe to proceed (nothing dirty, or the user chose
   * to discard), `false` when the user wants to stay and keep editing.
   *
   * Idempotent per transition: it never shows two dialogs for the same exit.
   * Concurrent callers share one in-flight prompt; and once the user agrees to
   * discard we clear `dirty`, so a follow-up check short-circuits on `!dirty`.
   */
  async confirm(): Promise<boolean> {
    if (!this.dirty()) return true;
    if (this.pending) return this.pending;

    this.pending = this.ask();
    try {
      return await this.pending;
    } finally {
      this.pending = null;
    }
  }

  private async ask(): Promise<boolean> {
    const ref = this.modal.open<boolean, ConfirmData>(ConfirmModal, {
      title: 'Cambios sin guardar',
      data: {
        message: 'Tienes cambios sin guardar en las columnas. Si sales ahora, se perderán.',
        confirmLabel: 'Salir sin guardar',
        cancelLabel: 'Seguir editando',
        destructive: true,
      },
    });

    const discard = (await ref.closed) === true;
    if (discard) this.dirty.set(false);
    return discard;
  }
}
