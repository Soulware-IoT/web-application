/// Mirrors the backend `InvitationResponse` / `InviteRequest` schemas.

import { ProfileSummary } from './organization-member.model';

/** Lifecycle of an invitation; the backend transitions it on accept/decline. */
export type InvitationStatus = 'pending' | 'accepted' | 'declined';

/** All statuses in display order — drives the filter chips. */
export const INVITATION_STATUSES: InvitationStatus[] = ['pending', 'accepted', 'declined'];

/** Mirrors the backend `InvitationResponse` schema. */
export interface InvitationResponse {
  id: string;
  email: string;
  organizationId: string;
  invitedBy?: ProfileSummary;
  invitedAt?: string;
  respondedAt?: string;
  status: InvitationStatus;
}

/** Body for `POST /organizations/{id}/invitations`. */
export interface InviteRequest {
  invitedEmail: string;
}
