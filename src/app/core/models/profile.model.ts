/// Mirrors the backend `ProfileResponse` schema. Optional fields are absent
/// until the user has filled them in. `id` is the profile id (== auth.users.id).
export interface ProfileResponse {
  id: string;
  fullName?: string;
  preferredName?: string;
  email?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}
