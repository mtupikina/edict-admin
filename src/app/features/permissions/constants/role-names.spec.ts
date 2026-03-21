import { ROLE_NAMES, userMayBeTutor } from './role-names';

describe('userMayBeTutor', () => {
  it('returns false for student-only', () => {
    expect(userMayBeTutor([ROLE_NAMES.STUDENT])).toBe(false);
  });

  it('returns true for tutor, admin, or super_admin', () => {
    expect(userMayBeTutor([ROLE_NAMES.TUTOR])).toBe(true);
    expect(userMayBeTutor([ROLE_NAMES.ADMIN])).toBe(true);
    expect(userMayBeTutor([ROLE_NAMES.SUPER_ADMIN])).toBe(true);
  });

  it('returns true when student is combined with tutor', () => {
    expect(userMayBeTutor([ROLE_NAMES.STUDENT, ROLE_NAMES.TUTOR])).toBe(true);
  });
});
