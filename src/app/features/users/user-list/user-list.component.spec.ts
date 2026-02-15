import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { UserListComponent } from './user-list.component';
import { UserService } from '../services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmationService, MessageService, Confirmation } from 'primeng/api';
import { User } from '../models/user.model';
import { UserFormSavePayload } from '../user-form-dialog/user-form-dialog.component';

const mockUser: User = {
  _id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@test.com',
  role: 'student',
  createdAt: '',
  updatedAt: '',
};

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let userService: jasmine.SpyObj<UserService>;
  let messageService: MessageService;

  beforeEach(async () => {
    userService = jasmine.createSpyObj('UserService', ['getAll', 'create', 'update', 'delete']);
    userService.getAll.and.returnValue(of([mockUser]));
    await TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [
        provideAnimations(),
        provideRouter([]),
        ConfirmationService,
        { provide: UserService, useValue: userService },
        { provide: AuthService, useValue: jasmine.createSpyObj('AuthService', ['logout']) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    // Component has its own MessageService (for Toast); spy on add() so we can assert
    messageService = fixture.debugElement.injector.get(MessageService);
    spyOn(messageService, 'add');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit loads users', () => {
    expect(userService.getAll).toHaveBeenCalled();
    expect(component.users).toEqual([mockUser]);
    expect(component.loading).toBe(false);
  });

  it('loadUsers on error sets loading false', (done) => {
    userService.getAll.and.returnValue(throwError(() => ({})));
    component.loadUsers();
    setTimeout(() => {
      expect(component.loading).toBe(false);
      done();
    }, 0);
  });

  it('openCreateDialog sets editingUser null and dialogVisible true', () => {
    component.openCreateDialog();
    expect(component.editingUser).toBeNull();
    expect(component.dialogVisible).toBe(true);
  });

  it('openEditDialog sets editingUser and dialogVisible true', () => {
    component.openEditDialog(mockUser);
    expect(component.editingUser).toBe(mockUser);
    expect(component.dialogVisible).toBe(true);
  });

  it('closeDialog resets dialog state', () => {
    component.dialogVisible = true;
    component.editingUser = mockUser;
    component.closeDialog();
    expect(component.dialogVisible).toBe(false);
    expect(component.editingUser).toBeNull();
  });

  it('onSave create calls userService.create and closes dialog', (done) => {
    userService.create.and.returnValue(of(mockUser));
    userService.getAll.and.returnValue(of([]));
    const payload: UserFormSavePayload = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@test.com',
      role: 'teacher',
    };
    component.onSave(payload);
    setTimeout(() => {
      expect(userService.create).toHaveBeenCalledWith(payload);
      expect(component.saving).toBe(false);
      expect(component.dialogVisible).toBe(false);
      done();
    }, 0);
  });

  it('onSave update calls userService.update and closes dialog', (done) => {
    userService.update.and.returnValue(of(mockUser));
    userService.getAll.and.returnValue(of([]));
    const payload: UserFormSavePayload = {
      id: '1',
      dto: { firstName: 'Jane', lastName: 'Doe', role: 'teacher' },
    };
    component.onSave(payload);
    setTimeout(() => {
      expect(userService.update).toHaveBeenCalledWith('1', payload.dto);
      expect(component.saving).toBe(false);
      expect(component.dialogVisible).toBe(false);
      done();
    }, 0);
  });

  it('onSave create error keeps saving false', fakeAsync(() => {
    userService.create.and.returnValue(throwError(() => ({ error: { message: 'Email taken' } })));
    component.onSave({
      firstName: 'J',
      lastName: 'D',
      email: 'j@test.com',
      role: 'student',
    });
    tick();
    expect(component.saving).toBe(false);
    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ detail: 'Email taken' })
    );
  }));

  it('onSave create error without message uses Request failed', fakeAsync(() => {
    userService.create.and.returnValue(throwError(() => ({})));
    component.onSave({
      firstName: 'J',
      lastName: 'D',
      email: 'j@test.com',
      role: 'student',
    });
    tick();
    expect(component.saving).toBe(false);
    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ detail: 'Request failed' })
    );
  }));

  it('onSave update error without message uses Request failed', fakeAsync(() => {
    userService.update.and.returnValue(throwError(() => ({})));
    component.onSave({
      id: '1',
      dto: { firstName: 'J', lastName: 'D', role: 'student' },
    });
    tick();
    expect(component.saving).toBe(false);
    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ detail: 'Request failed' })
    );
  }));

  it('confirmDelete calls confirmationService.confirm', () => {
    const conf = fixture.debugElement.injector.get(ConfirmationService);
    spyOn(conf, 'confirm').and.callFake((opts: Confirmation) => opts.accept?.());
    userService.delete.and.returnValue(of(undefined));
    userService.getAll.and.returnValue(of([]));
    component.confirmDelete(new Event('click'), mockUser);
    expect(conf.confirm).toHaveBeenCalled();
    expect(userService.delete).toHaveBeenCalledWith('1');
  });

  it('deleteUser on error shows message', fakeAsync(() => {
    const conf = fixture.debugElement.injector.get(ConfirmationService);
    spyOn(conf, 'confirm').and.callFake((opts: Confirmation) => opts.accept?.());
    userService.delete.and.returnValue(throwError(() => ({ error: { message: 'Server error' } })));
    component.confirmDelete(new Event('click'), mockUser);
    tick();
    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ detail: 'Server error' })
    );
  }));

  it('deleteUser on error without message uses Failed to delete user', fakeAsync(() => {
    const conf = fixture.debugElement.injector.get(ConfirmationService);
    spyOn(conf, 'confirm').and.callFake((opts: Confirmation) => opts.accept?.());
    userService.delete.and.returnValue(throwError(() => ({})));
    component.confirmDelete(new Event('click'), mockUser);
    tick();
    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ detail: 'Failed to delete user' })
    );
  }));

});
