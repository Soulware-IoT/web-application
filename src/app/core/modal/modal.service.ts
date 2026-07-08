import {
  ApplicationRef,
  EnvironmentInjector,
  Injectable,
  Injector,
  Type,
  createComponent,
  inject,
} from '@angular/core';
import { ModalRef } from './modal-ref';
import { ModalContainer } from './modal-container/modal-container';

export interface ModalConfig<D = unknown> {
  /** Heading shown in the modal chrome. */
  title?: string;
  /** Arbitrary payload made available to the content via `ModalRef.data`. */
  data?: D;
}

/**
 * Opens content components as accessible modal dialogs from anywhere in the app.
 * Callers depend only on this service — never on the overlay/backdrop details.
 */
@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly appRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);

  open<R = unknown, D = unknown>(
    content: Type<unknown>,
    config: ModalConfig<D> = {},
  ): ModalRef<R, D> {
    const ref = new ModalRef<R, D>(config.data);

    // Expose the ref to both the container chrome and the projected content.
    const elementInjector = Injector.create({
      parent: this.environmentInjector,
      providers: [{ provide: ModalRef, useValue: ref }],
    });

    const containerRef = createComponent(ModalContainer, {
      environmentInjector: this.environmentInjector,
      elementInjector,
    });
    containerRef.setInput('title', config.title ?? '');
    containerRef.setInput('content', content);

    this.appRef.attachView(containerRef.hostView);
    document.body.appendChild(containerRef.location.nativeElement);

    // Tear the DOM down once the caller (or the chrome) resolves the ref.
    ref.closed.finally(() => {
      this.appRef.detachView(containerRef.hostView);
      containerRef.destroy();
    });

    return ref;
  }
}
