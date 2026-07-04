/// Mirrors the backend `ControlProcessResponse` schema.
export interface ControlProcessResponse {
  id: string;
  organizationId: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

/// Body for `POST /organizations/{organizationId}/control-processes`.
export interface CreateControlProcessRequest {
  name: string;
}
