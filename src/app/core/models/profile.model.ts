/// Mirrors the backend `ProfileResponse` schema. Optional fields are absent
/// until the user has filled them in.
export interface ProfileResponse {
  profileId: string;
  fullName?: string;
  preferredName?: string;
  email?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}
