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

/** Color used to signal each lifecycle status across the UI. */
export const STATUS_COLOR: Record<ControlFormatStatus, string> = {
  draft: '#94a3b8',
  active: '#16a34a',
  suspended: '#d97706',
  ceased: '#dc2626',
};

export type LifecycleActionName = 'activate' | 'suspend' | 'resume' | 'cease';

export interface LifecycleAction {
  /** Matches the endpoint segment: POST /formats/{id}/{action}. */
  action: LifecycleActionName;
  label: string;
  /** Irreversible transitions require a confirmation step. */
  destructive?: boolean;
}

/**
 * Valid transitions per status — mirrors the backend state machine so the UI
 * never offers an action the server would reject. `ceased` is terminal.
 */
export const LIFECYCLE_ACTIONS: Record<ControlFormatStatus, LifecycleAction[]> = {
  draft: [{ action: 'activate', label: 'Activar' }],
  active: [
    { action: 'suspend', label: 'Suspender' },
    { action: 'cease', label: 'Cesar', destructive: true },
  ],
  suspended: [
    { action: 'resume', label: 'Reanudar' },
    { action: 'cease', label: 'Cesar', destructive: true },
  ],
  ceased: [],
};
