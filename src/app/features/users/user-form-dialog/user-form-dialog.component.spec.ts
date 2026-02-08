import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FormBuilder } from '@angular/forms';

import { UserFormDialogComponent, UserFormSavePayload } from './user-form-dialog.component';
import { User, UserRole, UpdateUserDto } from '../models/user.model';

const mockUser: User = {
  _id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@test.com',
  role: 'student',
  createdAt: '',
  updatedAt: '',
};

describe('UserFormDialogComponent', () => {
  let component: UserFormDialogComponent;
  let fixture: ComponentFixture<UserFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserFormDialogComponent],
      providers: [FormBuilder, provideAnimations()],
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
    expect(component.form.contains('role')).toBe(true);
    expect(component.form.get('role')?.value).toBe('student');
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
      role: 'teacher' as UserRole,
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
      role: 'teacher',
    });
  });

  it('submit with valid form (edit) emits update payload', () => {
    fixture.componentRef.setInput('user', mockUser);
    fixture.detectChanges();
    component.form.patchValue({
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'teacher' as UserRole,
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
      role: 'teacher',
    });
  });

  it('roles has Student, Teacher, Admin', () => {
    expect(component.roles.length).toBe(3);
    expect(component.roles.map((r) => r.label)).toEqual(['Student', 'Teacher', 'Admin']);
  });
});
