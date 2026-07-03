import { Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

export type ToastKind = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

/**
 * App-wide toast notifications. Services and components call `success`/`error`
 * to give feedback on actions; the `<app-toast-host>` renders the stack.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly toasts = signal<Toast[]>([]);

  private nextId = 0;

  success(message: string): void {
    this.show('success', message, 4000);
  }

  error(message: string): void {
    this.show('error', message, 6000);
  }

  info(message: string): void {
    this.show('info', message, 4000);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private show(kind: ToastKind, message: string, duration: number): void {
    const id = this.nextId++;
    this.toasts.update((list) => [...list, { id, kind, message }]);
    setTimeout(() => this.dismiss(id), duration);
  }
}

/** Extracts a user-facing message from a backend error (already translated). */
export function httpErrorMessage(
  err: unknown,
  fallback = 'Ocurrió un error inesperado. Intenta de nuevo.',
): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error;
    if (typeof body === 'string' && body.trim()) return body;
    if (body && typeof body === 'object') {
      const candidate =
        (body as Record<string, unknown>)['message'] ??
        (body as Record<string, unknown>)['error'] ??
        (body as Record<string, unknown>)['detail'];
      if (typeof candidate === 'string' && candidate.trim()) return candidate;
    }
  }
  return fallback;
}
