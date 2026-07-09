import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { SupportedLang, setPersistedLang } from '../../../../../../../core/i18n/persisted-lang';

interface LangOption {
  code: SupportedLang;
  labelKey: string;
}

const LANG_OPTIONS: LangOption[] = [
  { code: 'en', labelKey: 'common.language.en' },
  { code: 'es', labelKey: 'common.language.es' },
];

/** Lets the user switch the active UI language; persists the choice for next visit. */
@Component({
  selector: 'app-language-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe],
  template: `
    <div class="relative">
      <button
        type="button"
        (click)="toggle()"
        [attr.aria-expanded]="open()"
        aria-haspopup="listbox"
        [attr.aria-label]="'common.language.switch_aria' | transloco"
        class="grid w-full grid-cols-[16px_1fr_16px] items-center gap-2 rounded-[4px] border px-2.5 py-2 text-left text-sm transition-colors hover:bg-gray-50"
        style="border-color: #e2e8f0; color: #1a1a1a"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 0 20 15.3 15.3 0 0 1 0-20Z" />
        </svg>
        <span>{{ activeLabelKey() | transloco }}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          style="color: #4A4A4F" aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      @if (open()) {
        <div
          role="listbox"
          [attr.aria-label]="'common.language.switch_aria' | transloco"
          class="absolute bottom-full left-0 right-0 z-40 mb-1 overflow-hidden rounded-[4px] border bg-white shadow-lg"
          style="border-color: #e2e8f0"
        >
          @for (option of options; track option.code) {
            <button
              type="button"
              role="option"
              [attr.aria-selected]="option.code === activeLang()"
              (click)="select(option.code)"
              class="grid w-full grid-cols-[1fr_16px] items-center gap-2 px-2.5 py-2 text-left text-sm transition-colors hover:bg-gray-50"
              style="color: #1a1a1a"
            >
              <span>{{ option.labelKey | transloco }}</span>
              @if (option.code === activeLang()) {
                <svg
                  xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                  style="color: #0E3B63" aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              }
            </button>
          }
        </div>
      }
    </div>
  `,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'close()',
  },
})
export class LanguageSwitcher {
  private readonly transloco = inject(TranslocoService);
  private readonly host = inject(ElementRef);

  protected readonly options = LANG_OPTIONS;
  protected readonly open = signal(false);
  protected readonly activeLang = signal<SupportedLang>(this.transloco.getActiveLang() as SupportedLang);

  protected readonly activeLabelKey = computed(
    () => LANG_OPTIONS.find((o) => o.code === this.activeLang())?.labelKey ?? 'common.language.en',
  );

  protected toggle(): void {
    this.open.update((v) => !v);
  }

  protected close(): void {
    this.open.set(false);
  }

  protected select(lang: SupportedLang): void {
    this.transloco.setActiveLang(lang);
    setPersistedLang(lang);
    this.activeLang.set(lang);
    this.close();
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}
