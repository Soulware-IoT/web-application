import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { TranslocoPipe } from '@jsverse/transloco';
import {
  PermissionContext,
  PermissionLevel,
  Permissions,
} from '../../../../../core/models/organization-member.model';
import { OrganizationMemberService } from '../../../../../core/services/organization-member.service';
import { PermissionService } from '../../../../../core/services/permission.service';

const CONTEXTS: PermissionContext[] = ['security', 'organizations', 'internalControl'];
const LEVELS: PermissionLevel[] = ['none', 'assignee', 'lieutenant', 'admin'];

/** Detail pane: view/edit a member's permission levels per context. */
@Component({
  selector: 'app-member-permissions-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe],
  template: `
    @if (member(); as m) {
      <section
        class="grid content-start gap-6 rounded-2xl border p-6"
        style="border-color: #e2e8f0; background: #ffffff"
      >
        <header class="grid gap-1">
          <h2 class="text-lg font-semibold" style="color: #1a1a1a">
            {{ m.profile.preferredName || m.profile.fullName || ('organizations.members.no_name' | transloco) }}
          </h2>
          <p class="truncate text-sm" style="color: #64748b">{{ m.profile.email || '—' }}</p>
        </header>

        @if (isAdmin()) {
          <div
            class="grid items-start gap-2.5 rounded-xl border p-3"
            style="border-color: #fde68a; background: #fffbeb; grid-template-columns: auto minmax(0, 1fr)"
          >
            <span aria-hidden="true" class="text-sm leading-none" style="color: #b45309">🔒</span>
            <p class="text-xs" style="color: #92400e">
              {{ 'organizations.members.detail.admin_locked' | transloco }}
            </p>
          </div>
        } @else if (!canEdit()) {
          <p class="text-xs" style="color: #94a3b8">
            {{ 'organizations.members.detail.read_only' | transloco }}
          </p>
        }

        <div class="grid gap-4">
          @for (ctx of contexts; track ctx) {
            <div class="grid items-center gap-4" style="grid-template-columns: minmax(0, 1fr) auto">
              <label [for]="'perm-' + ctx" class="text-sm font-medium" style="color: #1a1a1a">
                {{ 'organizations.members.detail.contexts.' + ctx | transloco }}
              </label>
              <select
                [id]="'perm-' + ctx"
                [disabled]="!editable()"
                (change)="setLevel(ctx, $any($event.target).value)"
                class="rounded-lg border bg-white px-3 py-1.5 text-sm outline-none focus:border-[#0E3B63] disabled:opacity-60"
                style="border-color: #e2e8f0; color: #1a1a1a"
              >
                @for (level of levels; track level) {
                  <option [value]="level" [selected]="level === draft()[ctx]">
                    {{ 'organizations.members.roles.' + level | transloco }}
                  </option>
                }
              </select>
            </div>
          }
        </div>

        @if (editable()) {
          <div class="flex justify-end">
            <button
              type="button"
              (click)="save()"
              [disabled]="!dirty() || saving()"
              class="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
              style="background: #0E3B63"
            >
              {{
                (saving()
                  ? 'organizations.members.detail.saving'
                  : 'organizations.members.detail.save'
                ) | transloco
              }}
            </button>
          </div>
        }
      </section>
    } @else {
      <div class="grid place-items-center rounded-2xl border border-dashed p-10 text-center"
        style="border-color: #cbd5e1">
        <p class="text-sm" style="color: #64748b">
          {{
            (memberId()
              ? 'organizations.members.detail.not_found'
              : 'organizations.members.detail.placeholder'
            ) | transloco
          }}
        </p>
      </div>
    }
  `,
})
export class MemberPermissionsPanel {
  private readonly route = inject(ActivatedRoute);
  private readonly memberService = inject(OrganizationMemberService);
  private readonly permissions = inject(PermissionService);

  protected readonly contexts = CONTEXTS;
  protected readonly levels = LEVELS;
  protected readonly saving = signal(false);

  protected readonly memberId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('memberId'))),
    { initialValue: null },
  );

  protected readonly member = computed(() => {
    const id = this.memberId();
    return id ? this.memberService.memberById(id) : undefined;
  });

  /** Editing permissions requires the caller to be an org-admin. */
  protected readonly canEdit = computed(() => this.permissions.has('organizations', 'admin'));

  /** An org-admin's permissions are immutable server-side; the editor is locked. */
  protected readonly isAdmin = computed(
    () => this.member()?.permissions.organizations === 'admin',
  );

  /** Only editable when the caller may edit and the target isn't a locked admin. */
  protected readonly editable = computed(() => this.canEdit() && !this.isAdmin());

  /** Working copy of the member's permissions; resets when the member changes. */
  protected readonly draft = linkedSignal<Permissions>(
    () => this.member()?.permissions ?? { security: 'none', organizations: 'none', internalControl: 'none' },
  );

  protected readonly dirty = computed(() => {
    const original = this.member()?.permissions;
    if (!original) return false;
    return CONTEXTS.some((ctx) => this.draft()[ctx] !== original[ctx]);
  });

  protected setLevel(ctx: PermissionContext, level: string): void {
    this.draft.update((p) => ({ ...p, [ctx]: level as PermissionLevel }));
  }

  protected async save(): Promise<void> {
    const id = this.memberId();
    if (!id || !this.editable() || !this.dirty()) return;
    this.saving.set(true);
    await this.memberService.updatePermissions(id, this.draft());
    this.saving.set(false);
  }
}
