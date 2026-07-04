import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  ControlFormatResponse,
  Field,
  FIELD_TYPE_COLOR,
  FieldType,
  parseRules,
} from '../../../../../core/models/control-format.model';
import { ControlRegistryResponse } from '../../../../../core/models/control-registry.model';
import { ControlRegistryService } from '../../../../../core/services/control-registry.service';
import { ModalService } from '../../../../../core/modal/modal.service';
import { AddRegistryModal } from './add-registry-modal/add-registry-modal';

/** Per-column client-side filter, discriminated by the field type it applies to. */
type ColumnFilter =
  | { kind: 'text'; query: string }
  | { kind: 'number'; min: number | null; max: number | null }
  | { kind: 'date'; from: string | null; to: string | null }
  | { kind: 'select'; value: string };

/** Field types that expose a standard filter control. */
const FILTERABLE: ReadonlySet<FieldType> = new Set<FieldType>(['text', 'number', 'date', 'select']);

/** Excel-like read view of a format's registries (append-only, newest first). */
@Component({
  selector: 'app-registry-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full min-h-0' },
  templateUrl: './registry-grid.html',
})
export class RegistryGrid {
  private readonly registryService = inject(ControlRegistryService);
  private readonly modal = inject(ModalService);

  readonly format = input.required<ControlFormatResponse>();

  /** New registries are only accepted while the format is active. */
  protected readonly canAdd = computed(() => this.format().status === 'active');

  /** Placeholder rendered for missing/empty cell values. */
  protected readonly EMPTY = '—';
  protected readonly skeletonRows = [0, 1, 2, 3];

  protected readonly showFilters = signal(false);
  private readonly filters = signal<Record<string, ColumnFilter>>({});

  /** Columns in the format's declared order. */
  protected readonly columns = computed<Field[]>(() =>
    [...this.format().fields].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
  );

  protected readonly loading = computed(() => this.registryService.isLoading(this.format().id));

  protected readonly hasFilterableColumns = computed(() =>
    this.columns().some((c) => FILTERABLE.has(c.type)),
  );

  /** Registries newest-first — `createdAt` is the only ordering the backend gives. */
  protected readonly rows = computed<ControlRegistryResponse[]>(() => {
    const list = this.registryService.registriesFor(this.format().id) ?? [];
    return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  });

  /** Declared options per select column, taken from the field's validation rules. */
  protected readonly selectOptions = computed<Record<string, string[]>>(() => {
    const out: Record<string, string[]> = {};
    for (const col of this.columns()) {
      if (col.type !== 'select') continue;
      const rules = parseRules(col.type, col.validationRules);
      out[col.key] = rules.kind === 'select' ? rules.options : [];
    }
    return out;
  });

  protected readonly hasActiveFilters = computed(() =>
    Object.values(this.filters()).some((f) => this.isActive(f)),
  );

  /** Rows after applying every active column filter (AND-combined). */
  protected readonly filteredRows = computed<ControlRegistryResponse[]>(() => {
    const active = Object.entries(this.filters()).filter(([, f]) => this.isActive(f));
    if (active.length === 0) return this.rows();
    return this.rows().filter((row) => active.every(([key, f]) => this.matches(f, row.data[key])));
  });

  constructor() {
    effect(() => this.registryService.loadForFormat(this.format().id));
  }

  /** Opens the data-entry modal and appends the resulting registry. */
  protected async addRecord(): Promise<void> {
    const format = this.format();
    const ref = this.modal.open<Record<string, unknown>>(AddRegistryModal, {
      title: 'Agregar registro',
      data: { format },
    });

    const data = await ref.closed;
    if (data) await this.registryService.create(format.id, data);
  }

  protected typeColor(type: FieldType): string {
    return FIELD_TYPE_COLOR[type];
  }

  protected isFilterable(type: FieldType): boolean {
    return FILTERABLE.has(type);
  }

  // --- Filter reads (with defaults, so the template binds cleanly) ----------

  protected textValue(key: string): string {
    const f = this.filters()[key];
    return f && f.kind === 'text' ? f.query : '';
  }

  protected numberFilter(key: string): { min: number | null; max: number | null } {
    const f = this.filters()[key];
    return f && f.kind === 'number' ? f : { min: null, max: null };
  }

  protected dateFilter(key: string): { from: string | null; to: string | null } {
    const f = this.filters()[key];
    return f && f.kind === 'date' ? f : { from: null, to: null };
  }

  protected selectValue(key: string): string {
    const f = this.filters()[key];
    return f && f.kind === 'select' ? f.value : '';
  }

  // --- Filter writes --------------------------------------------------------

  protected setTextQuery(key: string, raw: string): void {
    this.filters.update((f) => ({ ...f, [key]: { kind: 'text', query: raw } }));
  }

  protected setNumberBound(key: string, which: 'min' | 'max', raw: string): void {
    const value = raw.trim() === '' ? null : Number(raw);
    const clean = value !== null && Number.isNaN(value) ? null : value;
    this.filters.update((f) => {
      const base = f[key]?.kind === 'number' ? (f[key] as { min: number | null; max: number | null }) : { min: null, max: null };
      return { ...f, [key]: { kind: 'number', ...base, [which]: clean } };
    });
  }

  protected setDateBound(key: string, which: 'from' | 'to', raw: string): void {
    const value = raw.trim() === '' ? null : raw;
    this.filters.update((f) => {
      const base = f[key]?.kind === 'date' ? (f[key] as { from: string | null; to: string | null }) : { from: null, to: null };
      return { ...f, [key]: { kind: 'date', ...base, [which]: value } };
    });
  }

  protected setSelectValue(key: string, value: string): void {
    this.filters.update((f) => ({ ...f, [key]: { kind: 'select', value } }));
  }

  protected clearFilters(): void {
    this.filters.set({});
  }

  // --- Cell rendering -------------------------------------------------------

  /** Formats a single cell value according to its field type. */
  protected cell(field: Field, registry: ControlRegistryResponse): string {
    const raw = registry.data[field.key];
    if (raw === null || raw === undefined || raw === '') return this.EMPTY;

    switch (field.type) {
      case 'boolean':
        return raw === true ? 'Sí' : raw === false ? 'No' : String(raw);
      case 'date':
        return this.formatDate(String(raw));
      default:
        return String(raw);
    }
  }

  protected formatCreatedAt(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('es', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private formatDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // --- Filter matching ------------------------------------------------------

  private isActive(f: ColumnFilter): boolean {
    switch (f.kind) {
      case 'text':
        return f.query.trim() !== '';
      case 'number':
        return f.min !== null || f.max !== null;
      case 'date':
        return !!f.from || !!f.to;
      case 'select':
        return f.value !== '';
    }
  }

  private matches(f: ColumnFilter, raw: unknown): boolean {
    // An active filter excludes rows with no value in that column.
    if (raw === null || raw === undefined || raw === '') return false;

    switch (f.kind) {
      case 'text':
        return String(raw).toLowerCase().includes(f.query.trim().toLowerCase());
      case 'number': {
        const n = Number(raw);
        if (Number.isNaN(n)) return false;
        if (f.min !== null && n < f.min) return false;
        if (f.max !== null && n > f.max) return false;
        return true;
      }
      case 'date': {
        const t = new Date(String(raw)).getTime();
        if (Number.isNaN(t)) return false;
        if (f.from && t < new Date(f.from).getTime()) return false;
        // `to` is inclusive of the whole day.
        if (f.to && t > new Date(f.to).getTime() + 86_400_000 - 1) return false;
        return true;
      }
      case 'select':
        return String(raw) === f.value;
    }
  }
}
