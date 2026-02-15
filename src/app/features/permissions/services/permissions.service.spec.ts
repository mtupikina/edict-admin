import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { environment } from '../../../../environments/environment';
import { PermissionsService } from './permissions.service';
import {
  Permission,
  CreatePermissionDto,
  UpdatePermissionDto,
  RolePermissionItem,
} from '../models/permission.model';
import { Role, CreateRoleDto, UpdateRoleDto } from '../models/role.model';

const baseUrl = environment.apiUrl;

const mockPermission: Permission = {
  _id: 'p1',
  name: 'read:users',
  resource: 'users',
  action: 'read',
  description: 'Read users',
};

const mockRole: Role = {
  _id: 'r1',
  name: 'admin',
  description: 'Administrator',
};

const mockRolePermissionItem: RolePermissionItem = {
  permissionId: 'p1',
  name: 'read:users',
};

describe('PermissionsService', () => {
  let service: PermissionsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PermissionsService],
    });
    service = TestBed.inject(PermissionsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Permissions', () => {
    it('getAllPermissions returns permissions', () => {
      service.getAllPermissions().subscribe((permissions) => {
        expect(permissions).toEqual([mockPermission]);
      });
      const req = httpMock.expectOne(`${baseUrl}/permissions`);
      req.flush([mockPermission]);
    });

    it('getPermission returns permission', () => {
      service.getPermission('p1').subscribe((permission) => {
        expect(permission).toEqual(mockPermission);
      });
      const req = httpMock.expectOne(`${baseUrl}/permissions/p1`);
      req.flush(mockPermission);
    });

    it('createPermission posts dto and returns permission', () => {
      const dto: CreatePermissionDto = {
        name: 'write:users',
        resource: 'users',
        action: 'write',
      };
      service.createPermission(dto).subscribe((permission) => {
        expect(permission).toEqual(mockPermission);
      });
      const req = httpMock.expectOne(`${baseUrl}/permissions`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(mockPermission);
    });

    it('updatePermission patches and returns permission', () => {
      const dto: UpdatePermissionDto = { name: 'read:users:v2' };
      service.updatePermission('p1', dto).subscribe((permission) => {
        expect(permission).toEqual(mockPermission);
      });
      const req = httpMock.expectOne(`${baseUrl}/permissions/p1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(dto);
      req.flush(mockPermission);
    });

    it('deletePermission sends DELETE', () => {
      service.deletePermission('p1').subscribe();
      const req = httpMock.expectOne(`${baseUrl}/permissions/p1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('Roles', () => {
    it('getAllRoles returns roles', () => {
      service.getAllRoles().subscribe((roles) => {
        expect(roles).toEqual([mockRole]);
      });
      const req = httpMock.expectOne(`${baseUrl}/roles`);
      req.flush([mockRole]);
    });

    it('getRole returns role', () => {
      service.getRole('r1').subscribe((role) => {
        expect(role).toEqual(mockRole);
      });
      const req = httpMock.expectOne(`${baseUrl}/roles/r1`);
      req.flush(mockRole);
    });

    it('createRole posts dto and returns role', () => {
      const dto: CreateRoleDto = { name: 'editor', description: 'Editor' };
      service.createRole(dto).subscribe((role) => {
        expect(role).toEqual(mockRole);
      });
      const req = httpMock.expectOne(`${baseUrl}/roles`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(mockRole);
    });

    it('updateRole patches and returns role', () => {
      const dto: UpdateRoleDto = { name: 'super-admin' };
      service.updateRole('r1', dto).subscribe((role) => {
        expect(role).toEqual(mockRole);
      });
      const req = httpMock.expectOne(`${baseUrl}/roles/r1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(dto);
      req.flush(mockRole);
    });

    it('deleteRole sends DELETE', () => {
      service.deleteRole('r1').subscribe();
      const req = httpMock.expectOne(`${baseUrl}/roles/r1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('getRolePermissions returns role permission items', () => {
      service.getRolePermissions('r1').subscribe((items) => {
        expect(items).toEqual([mockRolePermissionItem]);
      });
      const req = httpMock.expectOne(`${baseUrl}/roles/r1/permissions`);
      req.flush([mockRolePermissionItem]);
    });

    it('setRolePermissions patches permissionIds and returns role permission items', () => {
      const permissionIds = ['p1', 'p2'];
      service.setRolePermissions('r1', permissionIds).subscribe((items) => {
        expect(items).toEqual([mockRolePermissionItem]);
      });
      const req = httpMock.expectOne(`${baseUrl}/roles/r1/permissions`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ permissionIds });
      req.flush([mockRolePermissionItem]);
    });
  });
});
