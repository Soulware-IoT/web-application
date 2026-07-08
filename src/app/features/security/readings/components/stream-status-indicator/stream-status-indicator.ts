import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ReadingStreamService } from '../../../../../core/services/reading-stream.service';

/** Dot + label reflecting the live readings stream connection state. */
@Component({
  selector: 'app-stream-status-indicator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe],
  template: `
    <span
      class="grid grid-flow-col items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
      [style.background]="palette().bg"
      [style.color]="palette().fg"
      role="status"
    >
      <span
        class="h-1.5 w-1.5 rounded-full"
        [class.animate-pulse]="status() === 'live'"
        [style.background]="palette().dot"
        aria-hidden="true"
      ></span>
      {{ 'security.readings.stream.' + status() | transloco }}
    </span>
  `,
})
export class StreamStatusIndicator {
  private readonly readingStream = inject(ReadingStreamService);

  protected readonly status = this.readingStream.status;

  protected readonly palette = computed(() => {
    switch (this.status()) {
      case 'live':
        return { bg: '#ecfdf5', fg: '#047857', dot: '#10b981' };
      case 'connecting':
      case 'reconnecting':
        return { bg: '#fffbeb', fg: '#b45309', dot: '#f59e0b' };
      default:
        return { bg: '#f1f5f9', fg: '#475569', dot: '#94a3b8' };
    }
  });
}
