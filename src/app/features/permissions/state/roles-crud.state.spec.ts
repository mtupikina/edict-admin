import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { RolesCrudState } from './roles-crud.state';
import { PermissionsService } from '../services/permissions.service';
import { ConfirmationService, MessageService, Confirmation } from 'primeng/api';
import { Role } from '../models/role.model';

const mockRole: Role = {
  _id: 'r1',
  name: 'admin',
  description: 'Admin role',
};

describe('RolesCrudState', () => {
  let state: RolesCrudState;
  let api: jasmine.SpyObj<PermissionsService>;
  let messageService: MessageService;

  beforeEach(() => {
    api = jasmine.createSpyObj('PermissionsService', [
      'getAllRoles',
      'createRole',
      'updateRole',
      'deleteRole',
    ]);
    api.getAllRoles.and.returnValue(of([mockRole]));

    TestBed.configureTestingModule({
      providers: [
        RolesCrudState,
        ConfirmationService,
        MessageService,
        { provide: PermissionsService, useValue: api },
      ],
    });

    state = TestBed.inject(RolesCrudState);
    messageService = TestBed.inject(MessageService);
    spyOn(messageService, 'add');
  });

  it('should create and load roles on init', () => {
    expect(state).toBeTruthy();
    expect(api.getAllRoles).toHaveBeenCalled();
    expect(state.roles()).toEqual([mockRole]);
    expect(state.loading()).toBe(false);
  });

  it('load() on error sets loading false and shows message', (done) => {
    api.getAllRoles.and.returnValue(throwError(() => ({})));
    state.load();
    setTimeout(() => {
      expect(state.loading()).toBe(false);
      expect(messageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'error',
          detail: 'Failed to load roles',
        })
      );
      done();
    }, 0);
  });

  it('openCreate sets editing null and opens dialog', () => {
    state.editing.set(mockRole);
    state.openCreate();
    expect(state.editing()).toBeNull();
    expect(state.dialogVisible()).toBe(true);
  });

  it('openEdit sets editing role and opens dialog', () => {
    state.openEdit(mockRole);
    expect(state.editing()).toBe(mockRole);
    expect(state.dialogVisible()).toBe(true);
  });

  it('closeDialog hides dialog and clears editing', () => {
    state.dialogVisible.set(true);
    state.editing.set(mockRole);
    state.closeDialog();
    expect(state.dialogVisible()).toBe(false);
    expect(state.editing()).toBeNull();
  });

  it('save (create) calls createRole and on success closes and reloads', (done) => {
    api.createRole.and.returnValue(of(mockRole));
    api.getAllRoles.and.returnValue(of([]));
    state.openCreate();
    state.save({ name: 'editor', description: 'Editor' });

    setTimeout(() => {
      expect(api.createRole).toHaveBeenCalledWith({
        name: 'editor',
        description: 'Editor',
      });
      expect(state.saving()).toBe(false);
      expect(state.dialogVisible()).toBe(false);
      expect(messageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ detail: 'Role created' })
      );
      done();
    }, 0);
  });

  it('save (update) calls updateRole and on success closes and reloads', (done) => {
    state.editing.set(mockRole);
    api.updateRole.and.returnValue(of(mockRole));
    api.getAllRoles.and.returnValue(of([]));
    state.save({ name: 'admin_updated', description: 'Updated' });

    setTimeout(() => {
      expect(api.updateRole).toHaveBeenCalledWith('r1', {
        name: 'admin_updated',
        description: 'Updated',
      });
      expect(state.saving()).toBe(false);
      expect(state.dialogVisible()).toBe(false);
      expect(messageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ detail: 'Role updated' })
      );
      done();
    }, 0);
  });

  it('save on error sets saving false and shows error message', (done) => {
    api.createRole.and.returnValue(
      throwError(() => ({ error: { message: 'Conflict' } }))
    );
    state.openCreate();
    state.save({ name: 'x', description: '' });

    setTimeout(() => {
      expect(state.saving()).toBe(false);
      expect(messageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'error',
          detail: 'Conflict',
        })
      );
      done();
    }, 0);
  });

  it('save on error with no message uses default detail', (done) => {
    api.createRole.and.returnValue(throwError(() => ({})));
    state.openCreate();
    state.save({ name: 'x', description: '' });

    setTimeout(() => {
      expect(messageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'error',
          detail: 'Request failed',
        })
      );
      done();
    }, 0);
  });

  it('confirmDelete calls confirmation and on accept deletes and reloads', (done) => {
    const conf = TestBed.inject(ConfirmationService);
    spyOn(conf, 'confirm').and.callFake((opts: Confirmation) => {
      opts.accept?.();
      return conf;
    });
    api.deleteRole.and.returnValue(of(undefined));
    api.getAllRoles.and.returnValue(of([]));

    state.confirmDelete({
      role: mockRole,
      event: new Event('click'),
    });

    setTimeout(() => {
      expect(conf.confirm).toHaveBeenCalled();
      expect(api.deleteRole).toHaveBeenCalledWith('r1');
      expect(messageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ detail: 'Role deleted' })
      );
      done();
    }, 0);
  });

  it('confirmDelete accept on error shows message', (done) => {
    const conf = TestBed.inject(ConfirmationService);
    spyOn(conf, 'confirm').and.callFake((opts: Confirmation) => {
      opts.accept?.();
      return conf;
    });
    api.deleteRole.and.returnValue(
      throwError(() => ({ error: { message: 'Forbidden' } }))
    );

    state.confirmDelete({
      role: mockRole,
      event: new Event('click'),
    });

    setTimeout(() => {
      expect(messageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'error',
          detail: 'Forbidden',
        })
      );
      done();
    }, 0);
  });

  it('confirmDelete accept on error with no message uses default', (done) => {
    const conf = TestBed.inject(ConfirmationService);
    spyOn(conf, 'confirm').and.callFake((opts: Confirmation) => {
      opts.accept?.();
      return conf;
    });
    api.deleteRole.and.returnValue(throwError(() => ({})));

    state.confirmDelete({
      role: mockRole,
      event: new Event('click'),
    });

    setTimeout(() => {
      expect(messageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          detail: 'Failed to delete role',
        })
      );
      done();
    }, 0);
  });
});
