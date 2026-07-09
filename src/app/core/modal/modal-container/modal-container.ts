import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  Type,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { ModalRef } from '../modal-ref';

let nextId = 0;

@Component({
  selector: 'app-modal-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgComponentOutlet, TranslocoPipe],
  templateUrl: './modal-container.html',
  host: {
    '(keydown.escape)': 'ref.close()',
  },
})
export class ModalContainer implements AfterViewInit, OnDestroy {
  protected readonly ref = inject(ModalRef);
  protected readonly contentInjector = inject(Injector);

  readonly title = input('');
  readonly content = input.required<Type<unknown>>();

  protected readonly titleId = `modal-title-${nextId++}`;

  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  private previouslyFocused: HTMLElement | null = null;

  ngAfterViewInit(): void {
    this.previouslyFocused = document.activeElement as HTMLElement | null;
    const focusables = this.focusable();
    (focusables[0] ?? this.panel().nativeElement).focus();
  }

  ngOnDestroy(): void {
    this.previouslyFocused?.focus();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.ref.close();
  }

  protected onTab(event: Event, shift: boolean): void {
    const focusables = this.focusable();
    if (!focusables.length) {
      event.preventDefault();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (!shift && active === last) {
      event.preventDefault();
      first.focus();
    } else if (shift && active === first) {
      event.preventDefault();
      last.focus();
    }
  }

  private focusable(): HTMLElement[] {
    const selector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.from(this.panel().nativeElement.querySelectorAll<HTMLElement>(selector));
  }
}
