/// Mirrors the backend `OrganizationMemberResponse` / `Permissions` schemas.

/** Permission levels, lowest to highest — order matters for `meets()`. */
export type PermissionLevel = 'none' | 'assignee' | 'lieutenant' | 'admin';

/** Ordinal rank per level, so callers can compare "at least X". */
export const PERMISSION_RANK: Record<PermissionLevel, number> = {
  none: 0,
  assignee: 1,
  lieutenant: 2,
  admin: 3,
};

/** Independent permission scopes; a user's level differs per context. */
export type PermissionContext = keyof Permissions;

/** Caller's level in each context. Absent scopes are treated as `none`. */
export interface Permissions {
  security: PermissionLevel;
  organizations: PermissionLevel;
  internalControl: PermissionLevel;
}

/** Everyone starts with no access until the member DTO says otherwise. */
export const NO_PERMISSIONS: Permissions = {
  security: 'none',
  organizations: 'none',
  internalControl: 'none',
};

/** True when `level` is at least `min` in the ranking. */
export function meets(level: PermissionLevel | undefined, min: PermissionLevel): boolean {
  return PERMISSION_RANK[level ?? 'none'] >= PERMISSION_RANK[min];
}

/** Lightweight profile embedded in a member; `id` == `auth.users.id`. */
export interface ProfileSummary {
  id: string;
  fullName?: string;
  preferredName?: string;
  email?: string;
  avatarUrl?: string;
}

/** Mirrors the backend `OrganizationMemberResponse` schema. */
export interface OrganizationMemberResponse {
  id: string;
  organizationId: string;
  invitationId?: string;
  joinedAt?: string;
  permissions: Permissions;
  profile: ProfileSummary;
}
