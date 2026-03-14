import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';

import { UserFormDialogComponent, UserFormSavePayload } from './user-form-dialog.component';
import { User, UpdateUserDto } from '../models/user.model';
import { PermissionsService } from '../../permissions/services/permissions.service';

const mockRoles = [
  { _id: 'r1', name: 'student' },
  { _id: 'r2', name: 'teacher' },
  { _id: 'r3', name: 'admin' },
];

const mockUser: User = {
  _id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@test.com',
  roleIds: [mockRoles[0]],
  createdAt: '',
  updatedAt: '',
};

describe('UserFormDialogComponent', () => {
  let component: UserFormDialogComponent;
  let fixture: ComponentFixture<UserFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserFormDialogComponent],
      providers: [
        FormBuilder,
        provideAnimations(),
        {
          provide: PermissionsService,
          useValue: { getAllRoles: () => of(mockRoles) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormDialogComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('user', null);
    fixture.componentRef.setInput('visible', false);
    fixture.componentRef.setInput('saving', false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form has required controls', () => {
    expect(component.form.contains('firstName')).toBe(true);
    expect(component.form.contains('lastName')).toBe(true);
    expect(component.form.contains('email')).toBe(true);
    expect(component.form.contains('roleIds')).toBe(true);
  });

  it('close sets visible to false', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    component.close();
    expect(component.visible()).toBe(false);
  });

  it('submit with invalid form marks touched and does not emit', () => {
    let emitted: UserFormSavePayload | undefined;
    component.saveRequest.subscribe((e) => (emitted = e));
    component.form.controls.firstName.setValue('');
    component.submit();
    expect(component.form.get('firstName')?.touched).toBe(true);
    expect(emitted).toBeUndefined();
  });

  it('submit with valid form (create) emits CreateUserDto', () => {
    component.form.setValue({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@test.com',
      roleIds: ['r2'],
    });
    let emitted: UserFormSavePayload | undefined;
    component.saveRequest.subscribe((e) => (emitted = e));
    component.submit();
    expect(emitted).toBeDefined();
    expect('id' in emitted!).toBe(false);
    expect(emitted).toEqual({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@test.com',
      roleIds: ['r2'],
    });
  });

  it('submit with valid form (edit) emits update payload', () => {
    fixture.componentRef.setInput('user', mockUser);
    fixture.detectChanges();
    component.form.patchValue({
      firstName: 'Jane',
      lastName: 'Doe',
      roleIds: ['r2'],
    });
    component.form.get('email')?.disable();
    let emitted: UserFormSavePayload | undefined;
    component.saveRequest.subscribe((e) => (emitted = e));
    component.submit();
    expect(emitted).toBeDefined();
    expect('id' in emitted!).toBe(true);
    expect((emitted as { id: string; dto: UpdateUserDto }).id).toBe('1');
    expect((emitted as { id: string; dto: UpdateUserDto }).dto).toEqual({
      firstName: 'Jane',
      lastName: 'Doe',
      roleIds: ['r2'],
    });
  });

  it('loads assignable roles from PermissionsService', () => {
    expect(component.assignableRoles.length).toBe(3);
    expect(component.assignableRoles.map((r) => r.name)).toEqual(['student', 'teacher', 'admin']);
  });
});
