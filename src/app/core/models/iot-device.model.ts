/// Mirrors the backend IoT device schemas (security context).

/** Lifecycle status of a device. `provisioned` = claimed but not yet reporting. */
export type DeviceStatus = 'provisioned' | 'active' | 'inactive';

/** Warn/crit bounds for an integer-valued sensor (temperature). */
export interface TemperatureThreshold {
  warn?: number;
  crit?: number;
}

/** Warn/crit bounds for a decimal-valued sensor (gas). */
export interface GasThreshold {
  warn?: number;
  crit?: number;
}

/** Alarm thresholds carried by an IoT device. */
export interface Thresholds {
  temperature?: TemperatureThreshold;
  gas?: GasThreshold;
}

/** Mirrors the backend `IoTDeviceResponse` schema. */
export interface IoTDeviceResponse {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  status: DeviceStatus;
  thresholds?: Thresholds;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

/** Device count against the organization's plan limit. `limit: -1` = unlimited. */
export interface Quota {
  used: number;
  limit: number;
}

/** The backend signals an unlimited plan with a negative limit. */
export function isUnlimited(quota: Quota): boolean {
  return quota.limit < 0;
}

/** Mirrors `IoTDeviceListResponse` — `GET /organizations/{id}/iot-devices`. */
export interface IoTDeviceListResponse {
  devices: IoTDeviceResponse[];
  quota: Quota;
}

/// Body for `POST /organizations/{organizationId}/iot-devices`.
export interface ClaimDeviceRequest {
  code: string;
  name: string;
  thresholds?: Thresholds;
}

/// Body for `PATCH /iot-devices/{id}`.
export interface UpdateIoTDeviceRequest {
  name?: string;
  thresholds?: Thresholds;
  status?: 'active' | 'inactive';
}

/** Actuator command accepted by `POST /iot-devices/{id}/servo`. */
export type ServoCommand = 'start' | 'stop';

/// Body for `POST /iot-devices/{id}/servo`.
export interface ServoCommandRequest {
  command: ServoCommand;
}
