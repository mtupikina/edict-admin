import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { RolesPermissionsComponent } from './roles-permissions.component';
import { PermissionsService } from './services/permissions.service';
import { ConfirmationService, MessageService, Confirmation } from 'primeng/api';
import { Role } from './models/role.model';
import { Permission } from './models/permission.model';

const mockRoles: Role[] = [
  { _id: '1', name: 'admin', description: 'Admin role' },
];
const mockPermissions: Permission[] = [
  { _id: 'p1', name: 'words:read', description: 'Read words' },
];

describe('RolesPermissionsComponent', () => {
  let component: RolesPermissionsComponent;
  let fixture: ComponentFixture<RolesPermissionsComponent>;
  let permissionsService: jasmine.SpyObj<PermissionsService>;
  let messageService: MessageService;

  beforeEach(async () => {
    permissionsService = jasmine.createSpyObj('PermissionsService', [
      'getAllRoles',
      'getAllPermissions',
      'getRolePermissions',
      'createRole',
      'updateRole',
      'deleteRole',
      'createPermission',
      'updatePermission',
      'deletePermission',
      'setRolePermissions',
    ]);
    permissionsService.getAllRoles.and.returnValue(of(mockRoles));
    permissionsService.getAllPermissions.and.returnValue(of(mockPermissions));

    await TestBed.configureTestingModule({
      imports: [RolesPermissionsComponent],
      providers: [
        provideAnimations(),
        ConfirmationService,
        MessageService,
        { provide: PermissionsService, useValue: permissionsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RolesPermissionsComponent);
    component = fixture.componentInstance;
    messageService = fixture.debugElement.injector.get(MessageService);
    spyOn(messageService, 'add');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads roles and permissions on init (via state constructors)', () => {
    expect(permissionsService.getAllRoles).toHaveBeenCalled();
    expect(permissionsService.getAllPermissions).toHaveBeenCalled();
    expect(component.rolesState.roles()).toEqual(mockRoles);
    expect(component.permissionsState.permissions()).toEqual(mockPermissions);
    expect(component.rolesState.loading()).toBe(false);
    expect(component.permissionsState.loading()).toBe(false);
  });

  it('rolesState.openCreate opens dialog with no editing role', () => {
    component.rolesState.openCreate();
    expect(component.rolesState.editing()).toBeNull();
    expect(component.rolesState.dialogVisible()).toBe(true);
  });

  it('rolesState.openEdit sets editing role and opens dialog', () => {
    component.rolesState.openEdit(mockRoles[0]);
    expect(component.rolesState.editing()).toBe(mockRoles[0]);
    expect(component.rolesState.dialogVisible()).toBe(true);
  });

  it('rolesState.save create calls service and closes dialog', (done) => {
    permissionsService.createRole.and.returnValue(of(mockRoles[0]));
    permissionsService.getAllRoles.and.returnValue(of([]));
    component.rolesState.save({ name: 'editor', description: '' });
    setTimeout(() => {
      expect(permissionsService.createRole).toHaveBeenCalledWith({
        name: 'editor',
        description: '',
      });
      expect(component.rolesState.dialogVisible()).toBe(false);
      expect(component.rolesState.saving()).toBe(false);
      done();
    }, 0);
  });

  it('rolesState.save update calls service and closes dialog', (done) => {
    component.rolesState.editing.set(mockRoles[0]);
    permissionsService.updateRole.and.returnValue(of(mockRoles[0]));
    permissionsService.getAllRoles.and.returnValue(of([]));
    component.rolesState.save({ name: 'admin_updated', description: 'Updated' });
    setTimeout(() => {
      expect(permissionsService.updateRole).toHaveBeenCalledWith('1', {
        name: 'admin_updated',
        description: 'Updated',
      });
      expect(component.rolesState.dialogVisible()).toBe(false);
      expect(component.rolesState.saving()).toBe(false);
      done();
    }, 0);
  });

  it('rolesState.load on error shows message and sets loading false', (done) => {
    permissionsService.getAllRoles.and.returnValue(throwError(() => ({})));
    component.rolesState.load();
    setTimeout(() => {
      expect(component.rolesState.loading()).toBe(false);
      expect(messageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ detail: 'Failed to load roles' })
      );
      done();
    }, 0);
  });

  it('assignmentState.toggle adds and removes permission id', () => {
    component.assignmentState.selectedPermissionIds.set(new Set());
    component.assignmentState.toggle('p1', true);
    expect(component.assignmentState.selectedPermissionIds().has('p1')).toBe(
      true,
    );
    component.assignmentState.toggle('p1', false);
    expect(component.assignmentState.selectedPermissionIds().has('p1')).toBe(
      false,
    );
  });

  it('rolesState.confirmDelete calls confirmationService.confirm', () => {
    const conf = fixture.debugElement.injector.get(ConfirmationService);
    spyOn(conf, 'confirm').and.callFake((opts: Confirmation) => {
      opts.accept?.();
      return conf;
    });
    permissionsService.deleteRole.and.returnValue(of(undefined));
    permissionsService.getAllRoles.and.returnValue(of([]));
    component.rolesState.confirmDelete({
      role: mockRoles[0],
      event: new Event('click'),
    });
    expect(conf.confirm).toHaveBeenCalled();
    expect(permissionsService.deleteRole).toHaveBeenCalledWith('1');
  });

  it('permissionsState.confirmDelete calls confirmationService.confirm', () => {
    const conf = fixture.debugElement.injector.get(ConfirmationService);
    spyOn(conf, 'confirm').and.callFake((opts: Confirmation) => {
      opts.accept?.();
      return conf;
    });
    permissionsService.deletePermission.and.returnValue(of(undefined));
    permissionsService.getAllPermissions.and.returnValue(of([]));
    permissionsService.getAllRoles.and.returnValue(of([]));
    component.permissionsState.confirmDelete({
      perm: mockPermissions[0],
      event: new Event('click'),
    });
    expect(conf.confirm).toHaveBeenCalled();
    expect(permissionsService.deletePermission).toHaveBeenCalledWith('p1');
  });
});
