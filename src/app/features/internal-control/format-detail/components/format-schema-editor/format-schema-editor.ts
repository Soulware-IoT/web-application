import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import {
  ControlFormatResponse,
  FIELD_TYPE_COLOR,
  FieldInput,
  FieldType,
  ValidationRules,
  defaultRulesFor,
  parseRules,
} from '../../../../../core/models/control-format.model';
import { ControlFormatService } from '../../../../../core/services/control-format.service';
import { UnsavedChangesService } from '../../../../../core/unsaved-changes/unsaved-changes.service';

interface EditableField {
  id?: string;
  label: string;
  type: FieldType;
  required: boolean;
  rules: ValidationRules;
}

export const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Texto' },
  { value: 'number', label: 'Número' },
  { value: 'boolean', label: 'Sí / No' },
  { value: 'date', label: 'Fecha' },
  { value: 'select', label: 'Selección' },
];

@Component({
  selector: 'app-format-schema-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './format-schema-editor.html',
})
export class FormatSchemaEditor {
  private readonly formatService = inject(ControlFormatService);
  private readonly unsaved = inject(UnsavedChangesService);

  readonly format = input.required<ControlFormatResponse>();

  protected readonly types = FIELD_TYPES;
  protected readonly saving = signal(false);

  protected typeColor(type: FieldType): string {
    return FIELD_TYPE_COLOR[type];
  }

  /**
   * The pristine field list for the current format — recomputed whenever the
   * `format` input changes (initial load and after a save, since the service
   * refreshes it from the backend). Both the editable copy and the dirty
   * baseline derive from this, so a save resets "dirty" for free.
   */
  private readonly pristine = computed<EditableField[]>(() =>
    [...this.format().fields]
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      .map((f) => ({
        id: f.id,
        label: f.label,
        type: f.type,
        required: f.required,
        rules: parseRules(f.type, f.validationRules),
      })),
  );

  /** Editable working copy; resets whenever `pristine` changes. */
  protected readonly fields = linkedSignal<EditableField[]>(() => this.pristine());

  private readonly baseline = computed(() => this.snapshot(this.pristine()));

  /** True while the working copy diverges from what's persisted. */
  protected readonly dirty = computed(() => this.snapshot(this.fields()) !== this.baseline());

  protected readonly valid = computed(
    () => this.fields().length > 0 && this.fields().every((f) => f.label.trim().length > 0),
  );

  constructor() {
    // Publish dirty state to the shared guard; clear it when this editor goes away.
    effect(() => this.unsaved.setDirty(this.dirty()));
    inject(DestroyRef).onDestroy(() => this.unsaved.setDirty(false));
  }

  /** Order-sensitive value fingerprint used for dirty comparison. */
  private snapshot(list: EditableField[]): string {
    return JSON.stringify(
      list.map((f) => ({ label: f.label, type: f.type, required: f.required, rules: f.rules })),
    );
  }

  protected addField(): void {
    this.fields.update((list) => [
      ...list,
      { label: '', type: 'text', required: false, rules: defaultRulesFor('text') },
    ]);
  }

  protected removeField(index: number): void {
    this.fields.update((list) => list.filter((_, i) => i !== index));
  }

  protected move(index: number, direction: -1 | 1): void {
    this.fields.update((list) => {
      const target = index + direction;
      if (target < 0 || target >= list.length) return list;
      const next = [...list];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  protected setLabel(index: number, value: string): void {
    this.patch(index, { label: value });
  }

  /** Changing the type resets the rules to the fresh default for that type. */
  protected setType(index: number, value: string): void {
    const type = value as FieldType;
    this.patch(index, { type, rules: defaultRulesFor(type) });
  }

  protected setRequired(index: number, value: boolean): void {
    this.patch(index, { required: value });
  }

  protected setTextRule(index: number, key: 'minLength' | 'maxLength', raw: string): void {
    this.patchRules(index, { [key]: this.toNumberOrNull(raw) });
  }

  protected setNumberRule(index: number, key: 'min' | 'max', raw: string): void {
    this.patchRules(index, { [key]: this.toNumberOrNull(raw) });
  }

  protected setNumberKind(index: number, value: string): void {
    this.patchRules(index, { numberKind: value as 'integer' | 'decimal' });
  }

  protected addOption(index: number): void {
    this.updateOptions(index, (options) => [...options, '']);
  }

  protected setOption(index: number, optionIndex: number, value: string): void {
    this.updateOptions(index, (options) => options.map((o, i) => (i === optionIndex ? value : o)));
  }

  protected removeOption(index: number, optionIndex: number): void {
    this.updateOptions(index, (options) => options.filter((_, i) => i !== optionIndex));
  }

  protected async save(): Promise<void> {
    if (!this.valid()) return;
    const payload: FieldInput[] = this.fields().map((f, i) => ({
      id: f.id,
      label: f.label.trim(),
      type: f.type,
      required: f.required,
      displayOrder: i,
      validationRules: this.cleanRules(f.rules),
    }));

    this.saving.set(true);
    await this.formatService.replaceFields(this.format().id, payload);
    this.saving.set(false);
  }

  private patch(index: number, partial: Partial<EditableField>): void {
    this.fields.update((list) => list.map((f, i) => (i === index ? { ...f, ...partial } : f)));
  }

  private patchRules(index: number, partial: Record<string, unknown>): void {
    this.fields.update((list) =>
      list.map((f, i) => (i === index ? { ...f, rules: { ...f.rules, ...partial } as ValidationRules } : f)),
    );
  }

  private updateOptions(index: number, fn: (options: string[]) => string[]): void {
    this.fields.update((list) =>
      list.map((f, i) => {
        if (i !== index || f.rules.kind !== 'select') return f;
        return { ...f, rules: { ...f.rules, options: fn(f.rules.options) } };
      }),
    );
  }

  private toNumberOrNull(raw: string): number | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
  }

  /** Normalizes rules before sending. */
  private cleanRules(rules: ValidationRules): ValidationRules {
    if (rules.kind === 'select') {
      return { ...rules, options: rules.options.map((o) => o.trim()).filter(Boolean) };
    }
    // Regex patterns are a ReDoS vector and the backend has no safeguard yet, so
    // the UI never offers them and we strip any leftover before persisting.
    if (rules.kind === 'text') {
      return { kind: 'text', minLength: rules.minLength, maxLength: rules.maxLength, pattern: null };
    }
    return rules;
  }
}
