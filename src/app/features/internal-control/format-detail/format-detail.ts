import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { ControlFormatService } from '../../../core/services/control-format.service';
import { PermissionService } from '../../../core/services/permission.service';
import { UnsavedChangesService } from '../../../core/unsaved-changes/unsaved-changes.service';
import { FormatStatusMenu } from './components/format-status-menu/format-status-menu';
import { FormatSchemaEditor } from './components/format-schema-editor/format-schema-editor';
import { RegistryGrid } from './components/registry-grid/registry-grid';
import { FormatDetailSkeleton } from './components/format-detail-skeleton/format-detail-skeleton';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-format-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe, FormatStatusMenu, FormatSchemaEditor, RegistryGrid, FormatDetailSkeleton],
  template: `
    @if (loading()) {
      <app-format-detail-skeleton />
    } @else if (format(); as f) {
      <div class="grid h-full gap-6 p-8" style="grid-template-rows: auto 1fr">
        <!-- Header: big name (marquee-truncated) + status label -->
        <header class="grid gap-2">
          <div class="grid items-center gap-4" style="grid-template-columns: minmax(0, 1fr) auto">
            <h1
              class="marquee text-3xl font-bold leading-tight md:text-4xl"
              style="color: #1a1a1a"
            >
              <span class="marquee-inner">{{ f.name }}</span>
            </h1>
            <app-format-status-menu [format]="f" />
          </div>
        </header>

        <!-- Draft: column designer (admin only) · Non-draft: data grid -->
        @if (f.status === 'draft') {
          @if (canManage()) {
            <app-format-schema-editor [format]="f" />
          } @else {
            <div class="grid h-full place-items-center p-8 text-center">
              <p class="text-sm" style="color: #64748b">
                {{ 'internalControl.format.draft_locked' | transloco }}
              </p>
            </div>
          }
        } @else {
          <app-registry-grid [format]="f" />
        }
      </div>
    } @else {
      <div class="grid h-full place-items-center p-8">
        <p class="text-sm" style="color: #64748b">
          {{ 'internalControl.format.load_error' | transloco }}
        </p>
      </div>
    }
  `,
})
export class FormatDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formatService = inject(ControlFormatService);
  private readonly permissions = inject(PermissionService);
  private readonly unsaved = inject(UnsavedChangesService);

  /** Schema editing (drafts) requires context admin. */
  protected readonly canManage = computed(() => this.permissions.has('internalControl', 'admin'));

  private readonly formatId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('formatId'))),
    { initialValue: null },
  );

  /** The format actually loaded into view; lags `formatId` while we confirm. */
  private readonly loadedId = signal<string | null>(null);

  protected readonly format = this.formatService.format;
  protected readonly loading = this.formatService.formatLoading;

  constructor() {
    // Switching format reuses this component (only the param changes), so the
    // CanDeactivate guard never fires — we intercept the change here instead.
    effect(() => {
      const id = this.formatId();
      const current = untracked(() => this.loadedId());
      if (!id || id === current) return;

      if (untracked(() => this.unsaved.isDirty())) {
        this.unsaved.confirm().then((leave) => {
          if (leave) {
            this.load(id);
          } else if (current) {
            // Revert the URL; the re-run then sees id === current and no-ops.
            this.router.navigate(['/app/internal-control/formats', current]);
          }
        });
      } else {
        this.load(id);
      }
    });
  }

  private load(id: string): void {
    this.loadedId.set(id);
    this.formatService.loadDetail(id);
  }
}
