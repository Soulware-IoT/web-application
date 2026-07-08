/// Mirrors the backend `OrganizationResponse` / `Address` schemas.
import { ProfileSummary } from './organization-member.model';

/** Postal address; every field is optional. */
export interface Address {
  lineOne?: string;
  lineTwo?: string;
  reference?: string;
}

export interface OrganizationResponse {
  id: string;
  name: string;
  imageUrl?: string;
  address?: Address;
  ownedBy?: string;
  owner?: ProfileSummary;
  createdAt?: string;
}
