import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { RolePermissionsAssignmentState } from './role-permissions-assignment.state';
import { PermissionsCrudState } from './permissions-crud.state';
import { RolesCrudState } from './roles-crud.state';
import { PermissionsService } from '../services/permissions.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Role } from '../models/role.model';
import { RolePermissionItem } from '../models/permission.model';

const mockRole: Role = {
  _id: 'r1',
  name: 'admin',
  description: 'Admin',
};

const mockRolePermissionItems: RolePermissionItem[] = [
  { permissionId: 'p1', name: 'words:read' },
  { permissionId: 'p2', name: 'words:write' },
];

describe('RolePermissionsAssignmentState', () => {
  let state: RolePermissionsAssignmentState;
  let api: jasmine.SpyObj<PermissionsService>;
  let messageService: MessageService;

  beforeEach(() => {
    api = jasmine.createSpyObj('PermissionsService', [
      'getAllPermissions',
      'getAllRoles',
      'getRolePermissions',
      'setRolePermissions',
    ]);
    api.getAllPermissions.and.returnValue(of([]));
    api.getAllRoles.and.returnValue(of([]));
    api.getRolePermissions.and.returnValue(of(mockRolePermissionItems));

    TestBed.configureTestingModule({
      providers: [
        RolesCrudState,
        PermissionsCrudState,
        RolePermissionsAssignmentState,
        ConfirmationService,
        MessageService,
        { provide: PermissionsService, useValue: api },
      ],
    });

    state = TestBed.inject(RolePermissionsAssignmentState);
    messageService = TestBed.inject(MessageService);
    spyOn(messageService, 'add');
  });

  it('should create', () => {
    expect(state).toBeTruthy();
    expect(state.dialogVisible()).toBe(false);
    expect(state.role()).toBeNull();
    expect(state.selectedPermissionIds()).toEqual(new Set());
  });

  it('permissionsWithChecked maps permissions with checked from selectedPermissionIds', () => {
    const permsState = TestBed.inject(PermissionsCrudState);
    permsState.permissions.set([
      { _id: 'p1', name: 'a' },
      { _id: 'p2', name: 'b' },
    ]);
    state.selectedPermissionIds.set(new Set(['p1']));
    const result = state.permissionsWithChecked();
    expect(result).toEqual([
      { _id: 'p1', name: 'a', checked: true },
      { _id: 'p2', name: 'b', checked: false },
    ]);
  });

  it('open() fetches role permissions and opens dialog', (done) => {
    state.open(mockRole);
    expect(api.getRolePermissions).toHaveBeenCalledWith('r1');
    setTimeout(() => {
      expect(state.selectedPermissionIds()).toEqual(new Set(['p1', 'p2']));
      expect(state.role()).toEqual(mockRole);
      expect(state.dialogVisible()).toBe(true);
      done();
    }, 0);
  });

  it('open() on error shows message and does not open dialog', (done) => {
    api.getRolePermissions.and.returnValue(throwError(() => ({})));
    state.open(mockRole);
    setTimeout(() => {
      expect(messageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'error',
          detail: 'Failed to load role permissions',
        })
      );
      expect(state.dialogVisible()).toBe(false);
      done();
    }, 0);
  });

  it('close() hides dialog and clears role', () => {
    state.dialogVisible.set(true);
    state.role.set(mockRole);
    state.selectedPermissionIds.set(new Set(['p1']));
    state.close();
    expect(state.dialogVisible()).toBe(false);
    expect(state.role()).toBeNull();
  });

  it('toggle adds permission id when checked true', () => {
    state.selectedPermissionIds.set(new Set());
    state.toggle('p1', true);
    expect(state.selectedPermissionIds().has('p1')).toBe(true);
  });

  it('toggle removes permission id when checked false', () => {
    state.selectedPermissionIds.set(new Set(['p1']));
    state.toggle('p1', false);
    expect(state.selectedPermissionIds().has('p1')).toBe(false);
  });

  it('save() when no role does nothing', () => {
    state.role.set(null);
    state.save();
    expect(api.setRolePermissions).not.toHaveBeenCalled();
  });

  it('save() calls setRolePermissions and on success closes and shows message', (done) => {
    state.role.set(mockRole);
    state.selectedPermissionIds.set(new Set(['p1', 'p2']));
    api.setRolePermissions.and.returnValue(of(mockRolePermissionItems));

    state.save();

    setTimeout(() => {
      expect(api.setRolePermissions).toHaveBeenCalledWith('r1', ['p1', 'p2']);
      expect(state.saving()).toBe(false);
      expect(state.dialogVisible()).toBe(false);
      expect(state.role()).toBeNull();
      expect(messageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'success',
          detail: 'Role permissions updated',
        })
      );
      done();
    }, 0);
  });

  it('save() on error sets saving false and shows error message', (done) => {
    state.role.set(mockRole);
    state.selectedPermissionIds.set(new Set());
    api.setRolePermissions.and.returnValue(
      throwError(() => ({ error: { message: 'Conflict' } }))
    );

    state.save();

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

  it('save() on error with no message uses default detail', (done) => {
    state.role.set(mockRole);
    state.selectedPermissionIds.set(new Set());
    api.setRolePermissions.and.returnValue(throwError(() => ({})));

    state.save();

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
});
