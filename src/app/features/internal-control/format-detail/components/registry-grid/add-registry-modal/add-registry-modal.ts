import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { ModalRef } from '../../../../../../core/modal/modal-ref';
import {
  ControlFormatResponse,
  Field,
  parseRules,
} from '../../../../../../core/models/control-format.model';

export interface AddRegistryData {
  format: ControlFormatResponse;
}

/** Rejects non-integer numbers; passes empty values (handled by `required`). */
const integerValidator: ValidatorFn = (control) => {
  const value = control.value;
  if (value === null || value === undefined || value === '') return null;
  return Number.isInteger(Number(value)) ? null : { integer: true };
};

/**
 * Data-entry form for one new registry. Builds its controls dynamically from
 * the format's field definitions and mirrors each field's validation rules, so
 * the client rejects the same values the backend would.
 */
@Component({
  selector: 'app-add-registry-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslocoPipe],
  templateUrl: './add-registry-modal.html',
})
export class AddRegistryModal {
  protected readonly ref = inject(ModalRef) as ModalRef<Record<string, unknown>, AddRegistryData>;
  private readonly transloco = inject(TranslocoService);

  private readonly format = this.ref.data!.format;

  /** Fields in their declared order — matches the grid's column order. */
  protected readonly fields: Field[] = [...this.format.fields].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
  );

  /** Declared options per select field, for rendering the dropdowns. */
  protected readonly selectOptions: Record<string, string[]> = {};

  protected readonly form: FormGroup;

  constructor() {
    const controls: Record<string, FormControl> = {};
    for (const field of this.fields) {
      controls[field.key] = this.controlFor(field);
      if (field.type === 'select') {
        const rules = parseRules(field.type, field.validationRules);
        this.selectOptions[field.key] = rules.kind === 'select' ? rules.options : [];
      }
    }
    this.form = new FormGroup(controls);
  }

  protected numberStep(field: Field): string {
    const rules = parseRules(field.type, field.validationRules);
    return rules.kind === 'number' && rules.numberKind === 'integer' ? '1' : 'any';
  }

  /** User-facing error for a field, or null when valid/untouched. */
  protected errorFor(field: Field): string | null {
    const control = this.form.controls[field.key];
    if (!control || control.valid || !(control.touched || control.dirty)) return null;

    const errors = control.errors ?? {};
    const t = (key: string, params?: Record<string, unknown>) =>
      this.transloco.translate(`internalControl.form.errors.${key}`, params);
    if (errors['required']) return t('required');
    if (errors['minlength']) return t('min_length', { n: errors['minlength'].requiredLength });
    if (errors['maxlength']) return t('max_length', { n: errors['maxlength'].requiredLength });
    if (errors['min']) return t('min', { n: errors['min'].min });
    if (errors['max']) return t('max', { n: errors['max'].max });
    if (errors['integer']) return t('integer');
    if (errors['pattern']) return t('pattern');
    return t('invalid');
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const data: Record<string, unknown> = {};
    for (const field of this.fields) {
      const value = this.form.controls[field.key].value;
      if (field.type === 'boolean') {
        data[field.key] = value ?? false;
        continue;
      }
      // Optional fields left blank are omitted rather than sent as empty.
      if (value === null || value === undefined || value === '') continue;
      data[field.key] = value;
    }

    this.ref.close(data);
  }

  private controlFor(field: Field): FormControl {
    const validators = this.validatorsFor(field);
    switch (field.type) {
      case 'boolean':
        return new FormControl(false, { nonNullable: true });
      case 'number':
        return new FormControl<number | null>(null, { validators });
      default:
        return new FormControl('', { nonNullable: true, validators });
    }
  }

  private validatorsFor(field: Field): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    // A boolean checkbox always carries a value, so `required` is meaningless.
    if (field.required && field.type !== 'boolean') validators.push(Validators.required);

    const rules = parseRules(field.type, field.validationRules);
    if (rules.kind === 'text') {
      if (rules.minLength != null) validators.push(Validators.minLength(rules.minLength));
      if (rules.maxLength != null) validators.push(Validators.maxLength(rules.maxLength));
      if (rules.pattern) validators.push(Validators.pattern(rules.pattern));
    } else if (rules.kind === 'number') {
      if (rules.min != null) validators.push(Validators.min(rules.min));
      if (rules.max != null) validators.push(Validators.max(rules.max));
      if (rules.numberKind === 'integer') validators.push(integerValidator);
    }
    return validators;
  }
}
