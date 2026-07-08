import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { InvoiceResponse } from '../../../../../core/models/subscription.model';

/** A single invoice row: number, date, amount, status badge and links to the hosted invoice / PDF. */
@Component({
  selector: 'app-invoice-list-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, TranslocoPipe],
  template: `
    <div
      class="grid items-center gap-4 rounded-xl border p-4"
      style="border-color: #eef2f6; background: #ffffff; grid-template-columns: minmax(0, 1fr) auto auto"
    >
      <div class="grid gap-0.5">
        <p class="truncate text-sm font-medium" style="color: #1a1a1a">
          {{ invoice().number || ('organizations.invoices.no_number' | transloco) }}
        </p>
        <p class="truncate text-xs" style="color: #64748b">
          {{ (invoice().createdAt | date: 'mediumDate') || '—' }}
        </p>
      </div>

      <div class="grid justify-items-end gap-1">
        <p class="text-sm font-semibold" style="color: #1a1a1a">{{ amount() }}</p>
        @if (status(); as s) {
          <span
            class="rounded-full px-3 py-0.5 text-xs font-medium"
            [style.background]="s.bg"
            [style.color]="s.fg"
          >
            {{ 'organizations.invoices.status.' + s.key | transloco }}
          </span>
        }
      </div>

      <div class="flex items-center gap-2">
        @if (invoice().hostedInvoiceUrl; as url) {
          <a
            [href]="url"
            target="_blank"
            rel="noopener noreferrer"
            class="rounded-[3px] px-3 py-1.5 text-xs font-semibold transition-colors"
            style="color: #0E3B63; border: 1px solid #cbd5e1"
          >
            {{ 'organizations.invoices.view' | transloco }}
          </a>
        }
        @if (invoice().invoicePdfUrl; as pdf) {
          <a
            [href]="pdf"
            target="_blank"
            rel="noopener noreferrer"
            class="rounded-[3px] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style="background-color: #0E3B63"
          >
            {{ 'organizations.invoices.download' | transloco }}
          </a>
        }
      </div>
    </div>
  `,
})
export class InvoiceListItem {
  readonly invoice = input.required<InvoiceResponse>();

  /** Amount paid is in the currency's smallest unit; render it in the invoice currency. */
  protected readonly amount = computed(() => {
    const inv = this.invoice();
    const currency = (inv.currency ?? 'usd').toUpperCase();
    const value = (inv.amountPaid ?? 0) / 100;
    return this.currencyPipe.transform(value, currency) ?? `${value}`;
  });

  /** Maps the Stripe invoice status to a translation key and badge colors. */
  protected readonly status = computed(() => {
    const raw = this.invoice().status?.toLowerCase();
    if (!raw) return null;
    const styles: Record<string, { bg: string; fg: string }> = {
      paid: { bg: '#dcfce7', fg: '#166534' },
      open: { bg: '#fef9c3', fg: '#854d0e' },
      void: { bg: '#f1f5f9', fg: '#475569' },
      uncollectible: { bg: '#fee2e2', fg: '#991b1b' },
      draft: { bg: '#f1f5f9', fg: '#475569' },
    };
    const style = styles[raw] ?? { bg: '#f1f5f9', fg: '#475569' };
    return { key: raw, ...style };
  });

  private readonly currencyPipe = new CurrencyPipe('en-US');
}
