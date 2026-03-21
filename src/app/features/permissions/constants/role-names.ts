/**
 * Canonical role name strings for this app (keep in sync with edict-admin-be `ROLES`).
 * Single definition in edict-admin — import from here instead of duplicating literals.
 */
export const ROLE_NAMES = {
  STUDENT: 'student',
  TUTOR: 'tutor',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const;

const TUTOR_ELIGIBLE = new Set<string>([
  ROLE_NAMES.TUTOR,
  ROLE_NAMES.ADMIN,
  ROLE_NAMES.SUPER_ADMIN,
]);

export function userMayBeTutor(roleNames: string[]): boolean {
  return roleNames.some((name) => TUTOR_ELIGIBLE.has(name));
}
