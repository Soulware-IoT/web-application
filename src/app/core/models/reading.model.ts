/// Mirrors the backend `Reading` schema, pushed over the SSE endpoint
/// `GET /organizations/{organizationId}/readings/stream`.

/** How the backend classified the reading against the device thresholds. */
export type ReadingSeverity = 'safe' | 'warning' | 'critical';

/** A single sensor reading relayed by the organization's edge device. */
export interface Reading {
  deviceCode: string;
  temperatureC?: number;
  gasPpm?: number;
  severity: ReadingSeverity;
  occurredAt: string;
}
