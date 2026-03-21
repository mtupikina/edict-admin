import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTableComponent } from './user-table.component';
import { User } from '../models/user.model';
import { ROLE_NAMES } from '../../permissions/constants/role-names';

const mockUser: User = {
  _id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@test.com',
  roleIds: [{ _id: 'r1', name: 'student' }],
  createdAt: '',
  updatedAt: '',
};

describe('UserTableComponent', () => {
  let component: UserTableComponent;
  let fixture: ComponentFixture<UserTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('users', [mockUser]);
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onEdit emits user', () => {
    let emitted: User | undefined;
    component.editUser.subscribe((u) => (emitted = u));
    component.onEdit(mockUser);
    expect(emitted).toBe(mockUser);
  });

  it('onDelete emits event and user', () => {
    let emitted: { event: Event; user: User } | undefined;
    component.deleteUser.subscribe((e) => (emitted = e));
    const ev = new Event('click');
    component.onDelete(ev, mockUser);
    expect(emitted?.event).toBe(ev);
    expect(emitted?.user).toBe(mockUser);
  });

  it('tutorRowsFor resolves tutor ids to names from the users list', () => {
    const tutor: User = {
      _id: 't1',
      firstName: 'Ann',
      lastName: 'Tutor',
      email: 'ann@test.com',
      roleIds: [{ _id: 'r2', name: 'tutor' }],
      createdAt: '',
      updatedAt: '',
    };
    const student: User = {
      _id: 's1',
      firstName: 'Stu',
      lastName: 'Dent',
      email: 'stu@test.com',
      roleIds: [{ _id: 'r1', name: 'student' }],
      tutorIds: ['t1'],
      createdAt: '',
      updatedAt: '',
    };
    fixture.componentRef.setInput('users', [student, tutor]);
    expect(component.tutorRowsFor(student)).toEqual([
      { tutorUserId: 't1', label: 'Ann Tutor' },
    ]);
  });

  it('tutorRowsFor uses email when first and last name are blank', () => {
    const tutor: User = {
      _id: 't1',
      firstName: ' ',
      lastName: ' ',
      email: 'only@email.com',
      roleIds: [{ _id: 'r2', name: 'tutor' }],
      createdAt: '',
      updatedAt: '',
    };
    const student: User = {
      _id: 's1',
      firstName: 'S',
      lastName: 'D',
      email: 's@test.com',
      roleIds: [{ _id: 'r1', name: 'student' }],
      tutorIds: ['t1'],
      createdAt: '',
      updatedAt: '',
    };
    fixture.componentRef.setInput('users', [student, tutor]);
    expect(component.tutorRowsFor(student)[0].label).toBe('only@email.com');
  });

  it('tutorRowsFor marks missing tutors as unknown', () => {
    const student: User = {
      _id: 's1',
      firstName: 'S',
      lastName: 'D',
      email: 's@test.com',
      roleIds: [{ _id: 'r1', name: 'student' }],
      tutorIds: ['missing-id'],
      createdAt: '',
      updatedAt: '',
    };
    fixture.componentRef.setInput('users', [student]);
    expect(component.tutorRowsFor(student)).toEqual([
      { tutorUserId: 'missing-id', label: 'Unknown user' },
    ]);
  });

  it('tutorRowsFor returns empty when tutorIds unset', () => {
    expect(component.tutorRowsFor(mockUser)).toEqual([]);
  });

  it('hasSuperAdminRole is true when user has super_admin role', () => {
    const sa: User = {
      ...mockUser,
      roleIds: [{ _id: 'rsa', name: ROLE_NAMES.SUPER_ADMIN }],
    };
    expect(component.hasSuperAdminRole(sa)).toBe(true);
    expect(component.hasSuperAdminRole(mockUser)).toBe(false);
  });
});
