import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { PermissionsCrudState } from './permissions-crud.state';
import { RolesCrudState } from './roles-crud.state';
import { PermissionsService } from '../services/permissions.service';
import { ConfirmationService, MessageService, Confirmation } from 'primeng/api';
import { Permission, CreatePermissionDto } from '../models/permission.model';

const mockPermission: Permission = {
  _id: 'p1',
  name: 'words:read',
  description: 'Read words',
};

describe('PermissionsCrudState', () => {
  let state: PermissionsCrudState;
  let api: jasmine.SpyObj<PermissionsService>;
  let messageService: MessageService;
  let rolesState: RolesCrudState;

  beforeEach(() => {
    api = jasmine.createSpyObj('PermissionsService', [
      'getAllPermissions',
      'getAllRoles',
      'createPermission',
      'updatePermission',
      'deletePermission',
    ]);
    api.getAllPermissions.and.returnValue(of([mockPermission]));
    api.getAllRoles.and.returnValue(of([]));

    TestBed.configureTestingModule({
      providers: [
        RolesCrudState,
        PermissionsCrudState,
        ConfirmationService,
        MessageService,
        { provide: PermissionsService, useValue: api },
      ],
    });

    rolesState = TestBed.inject(RolesCrudState);
    state = TestBed.inject(PermissionsCrudState);
    messageService = TestBed.inject(MessageService);
    spyOn(messageService, 'add');
  });

  it('should create and load permissions on init', () => {
    expect(state).toBeTruthy();
    expect(api.getAllPermissions).toHaveBeenCalled();
    expect(state.permissions()).toEqual([mockPermission]);
    expect(state.loading()).toBe(false);
  });

  it('load() on error sets loading false and shows message', (done) => {
    api.getAllPermissions.and.returnValue(throwError(() => ({})));
    state.load();
    setTimeout(() => {
      expect(state.loading()).toBe(false);
      expect(messageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'error',
          detail: 'Failed to load permissions',
        })
      );
      done();
    }, 0);
  });

  it('openCreate sets editing null and opens dialog', () => {
    state.editing.set(mockPermission);
    state.openCreate();
    expect(state.editing()).toBeNull();
    expect(state.dialogVisible()).toBe(true);
  });

  it('openEdit sets editing permission and opens dialog', () => {
    state.openEdit(mockPermission);
    expect(state.editing()).toBe(mockPermission);
    expect(state.dialogVisible()).toBe(true);
  });

  it('closeDialog hides dialog and clears editing', () => {
    state.dialogVisible.set(true);
    state.editing.set(mockPermission);
    state.closeDialog();
    expect(state.dialogVisible()).toBe(false);
    expect(state.editing()).toBeNull();
  });

  it('save (create) calls createPermission and on success closes and reloads', (done) => {
    const dto: CreatePermissionDto = {
      name: 'words:write',
      description: 'Write words',
    };
    api.createPermission.and.returnValue(of(mockPermission));
    api.getAllPermissions.and.returnValue(of([]));
    state.openCreate();
    state.save(dto);

    setTimeout(() => {
      expect(api.createPermission).toHaveBeenCalledWith(dto);
      expect(state.saving()).toBe(false);
      expect(state.dialogVisible()).toBe(false);
      expect(messageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ detail: 'Permission created' })
      );
      done();
    }, 0);
  });

  it('save (update) calls updatePermission and on success closes and reloads', (done) => {
    state.editing.set(mockPermission);
    const dto: CreatePermissionDto = { name: 'words:read:v2' };
    api.updatePermission.and.returnValue(of(mockPermission));
    api.getAllPermissions.and.returnValue(of([]));
    state.save(dto);

    setTimeout(() => {
      expect(api.updatePermission).toHaveBeenCalledWith('p1', dto);
      expect(state.saving()).toBe(false);
      expect(state.dialogVisible()).toBe(false);
      expect(messageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ detail: 'Permission updated' })
      );
      done();
    }, 0);
  });

  it('save on error sets saving false and shows error message', (done) => {
    api.createPermission.and.returnValue(
      throwError(() => ({ error: { message: 'Conflict' } }))
    );
    state.openCreate();
    state.save({ name: 'x' });

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
    api.createPermission.and.returnValue(throwError(() => ({})));
    state.openCreate();
    state.save({ name: 'x' });

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

  it('confirmDelete calls confirmation and on accept deletes, reloads permissions and roles', (done) => {
    const conf = TestBed.inject(ConfirmationService);
    spyOn(conf, 'confirm').and.callFake((opts: Confirmation) => {
      opts.accept?.();
      return conf;
    });
    api.deletePermission.and.returnValue(of(undefined));
    api.getAllPermissions.and.returnValue(of([]));
    api.getAllRoles.and.returnValue(of([]));
    spyOn(rolesState, 'load');

    state.confirmDelete({
      perm: mockPermission,
      event: new Event('click'),
    });

    setTimeout(() => {
      expect(conf.confirm).toHaveBeenCalled();
      expect(api.deletePermission).toHaveBeenCalledWith('p1');
      expect(rolesState.load).toHaveBeenCalled();
      expect(messageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ detail: 'Permission deleted' })
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
    api.deletePermission.and.returnValue(
      throwError(() => ({ error: { message: 'Forbidden' } }))
    );

    state.confirmDelete({
      perm: mockPermission,
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
    api.deletePermission.and.returnValue(throwError(() => ({})));

    state.confirmDelete({
      perm: mockPermission,
      event: new Event('click'),
    });

    setTimeout(() => {
      expect(messageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          detail: 'Failed to delete permission',
        })
      );
      done();
    }, 0);
  });
});
