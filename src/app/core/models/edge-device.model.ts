import { DeviceStatus } from './iot-device.model';

/// Mirrors the backend edge device schemas (security context).
/// An organization owns at most ONE edge device — the gateway that relays
/// the IoT sensors' readings to the backend.

/** Mirrors the backend `EdgeDeviceResponse` schema. */
export interface EdgeDeviceResponse {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  status: DeviceStatus;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

/// Body for `POST /organizations/{organizationId}/edge-device`.
export interface ClaimEdgeDeviceRequest {
  code: string;
  name: string;
}

/// Body for `PATCH /edge-device/{id}`.
export interface UpdateEdgeDeviceRequest {
  name?: string;
  status?: 'active' | 'inactive';
}
