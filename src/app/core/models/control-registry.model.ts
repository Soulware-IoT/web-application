/// Mirrors the backend `ControlRegistryResponse` schema.

/**
 * One saved record for a format. `data` is a free-form map keyed by each
 * field's `key`; values are typed per the field definition (string, number,
 * boolean, ISO date string). Registries are append-only — no update/delete.
 */
export interface ControlRegistryResponse {
  id: string;
  formatId: string;
  data: Record<string, unknown>;
  createdAt: string;
}

/** Body for `POST /formats/{formatId}/registries`. */
export interface CreateControlRegistryRequest {
  data: Record<string, unknown>;
}
