/// Mirrors the backend `OrganizationResponse` schema.
export interface OrganizationResponse {
  id: string;
  name: string;
  imageUrl?: string;
  addressLineOne?: string;
  addressLineTwo?: string;
  addressReference?: string;
  ownedBy?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}
