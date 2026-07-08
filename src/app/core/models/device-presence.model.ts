/// Mirrors the backend device presence schemas, served as a snapshot
/// (`GET /organizations/{id}/devices/presence`) plus an SSE stream
/// (`GET /organizations/{id}/devices/presence/stream`).

/** Connectivity of a device — orthogonal to its activation lifecycle. */
export type PresenceStatus = 'online' | 'offline';

/** Which family the device belongs to. */
export type PresenceKind = 'edge' | 'iot';

/** Mirrors the backend `DevicePresenceResponse` schema. */
export interface DevicePresenceResponse {
  deviceId: string;
  deviceCode: string;
  kind: PresenceKind;
  status: PresenceStatus;
  since?: string;
}
