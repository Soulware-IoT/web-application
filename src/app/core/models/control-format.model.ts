/// Mirrors the backend `ControlFormatResponse` schema.
export type ControlFormatStatus = 'draft' | 'active' | 'suspended' | 'ceased';

export type FieldType = 'text' | 'number' | 'boolean' | 'date' | 'select';

export interface Field {
  id: string;
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  displayOrder: number;
  validationRules?: unknown;
}

export interface ControlFormatResponse {
  id: string;
  processId: string;
  name: string;
  status: ControlFormatStatus;
  fields: Field[];
  createdAt?: string;
  updatedAt?: string;
}

export type NumberKind = 'integer' | 'decimal';

/**
 * Discriminated union mirroring the backend `ValidationRules` (discriminator
 * `kind`). Rules vary per field type; boolean/date carry no rules ('none').
 *
 * NOTE: the `kind` string values below must match the backend discriminator.
 * If the API expects different casing, change them here (single source).
 */
export type ValidationRules =
  | { kind: 'none' }
  | { kind: 'text'; minLength?: number | null; maxLength?: number | null; pattern?: string | null }
  | { kind: 'number'; numberKind: NumberKind; min?: number | null; max?: number | null }
  | { kind: 'select'; options: string[] };

/** Default (empty) rules for a freshly-selected field type. */
export function defaultRulesFor(type: FieldType): ValidationRules {
  switch (type) {
    case 'text':
      return { kind: 'text' };
    case 'number':
      return { kind: 'number', numberKind: 'integer' };
    case 'select':
      return { kind: 'select', options: [] };
    default:
      return { kind: 'none' };
  }
}

/** Normalizes a raw `validationRules` object from the API, keyed by field type. */
export function parseRules(type: FieldType, raw: unknown): ValidationRules {
  const r = (raw ?? {}) as Record<string, unknown>;
  switch (type) {
    case 'text':
      return {
        kind: 'text',
        minLength: (r['minLength'] as number) ?? null,
        maxLength: (r['maxLength'] as number) ?? null,
        pattern: (r['pattern'] as string) ?? null,
      };
    case 'number':
      return {
        kind: 'number',
        numberKind: (r['numberKind'] as NumberKind) ?? 'integer',
        min: (r['min'] as number) ?? null,
        max: (r['max'] as number) ?? null,
      };
    case 'select':
      return { kind: 'select', options: Array.isArray(r['options']) ? [...(r['options'] as string[])] : [] };
    default:
      return { kind: 'none' };
  }
}

/** One item in the full-state `PUT /formats/{id}/fields` payload. */
export interface FieldInput {
  /** Present for existing fields; omit for new ones (backend assigns it). */
  id?: string;
  label: string;
  type: FieldType;
  required: boolean;
  displayOrder: number;
  validationRules: ValidationRules;
}

/** Color used to signal each lifecycle status across the UI. */
export const STATUS_COLOR: Record<ControlFormatStatus, string> = {
  draft: '#94a3b8',
  active: '#16a34a',
  suspended: '#d97706',
  ceased: '#dc2626',
};

/**
 * Accent color per field type. Same color-coding pattern as STATUS_COLOR; used
 * as a redundant visual cue (row accent in the schema editor, column headers in
 * the data grid) — never the only signal, since the type is always named too.
 */
export const FIELD_TYPE_COLOR: Record<FieldType, string> = {
  text: '#0E3B63',
  number: '#0f766e',
  boolean: '#6d28d9',
  date: '#0369a1',
  select: '#b45309',
};

export type LifecycleActionName = 'activate' | 'suspend' | 'resume' | 'cease';

export interface LifecycleAction {
  /** Matches the endpoint segment: POST /formats/{id}/{action}. */
  action: LifecycleActionName;
  /** i18n key resolved in the template via the transloco pipe. */
  label: string;
  /** Irreversible transitions require a confirmation step. */
  destructive?: boolean;
}

/**
 * Valid transitions per status — mirrors the backend state machine so the UI
 * never offers an action the server would reject. `ceased` is terminal.
 */
export const LIFECYCLE_ACTIONS: Record<ControlFormatStatus, LifecycleAction[]> = {
  draft: [{ action: 'activate', label: 'internalControl.lifecycle.activate' }],
  active: [
    { action: 'suspend', label: 'internalControl.lifecycle.suspend' },
    { action: 'cease', label: 'internalControl.lifecycle.cease', destructive: true },
  ],
  suspended: [
    { action: 'resume', label: 'internalControl.lifecycle.resume' },
    { action: 'cease', label: 'internalControl.lifecycle.cease', destructive: true },
  ],
  ceased: [],
};
