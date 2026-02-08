import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTableComponent } from './user-table.component';
import { User } from '../models/user.model';

const mockUser: User = {
  _id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@test.com',
  role: 'student',
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
});
