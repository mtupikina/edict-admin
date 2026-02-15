import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  Permission,
  CreatePermissionDto,
  UpdatePermissionDto,
  RolePermissionItem,
} from '../models/permission.model';
import { Role, CreateRoleDto, UpdateRoleDto } from '../models/role.model';

@Injectable({ providedIn: 'root' })
export class PermissionsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // Permissions
  getAllPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.baseUrl}/permissions`);
  }

  getPermission(id: string): Observable<Permission> {
    return this.http.get<Permission>(`${this.baseUrl}/permissions/${id}`);
  }

  createPermission(dto: CreatePermissionDto): Observable<Permission> {
    return this.http.post<Permission>(`${this.baseUrl}/permissions`, dto);
  }

  updatePermission(id: string, dto: UpdatePermissionDto): Observable<Permission> {
    return this.http.patch<Permission>(`${this.baseUrl}/permissions/${id}`, dto);
  }

  deletePermission(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/permissions/${id}`);
  }

  // Roles
  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.baseUrl}/roles`);
  }

  getRole(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.baseUrl}/roles/${id}`);
  }

  createRole(dto: CreateRoleDto): Observable<Role> {
    return this.http.post<Role>(`${this.baseUrl}/roles`, dto);
  }

  updateRole(id: string, dto: UpdateRoleDto): Observable<Role> {
    return this.http.patch<Role>(`${this.baseUrl}/roles/${id}`, dto);
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/roles/${id}`);
  }

  getRolePermissions(roleId: string): Observable<RolePermissionItem[]> {
    return this.http.get<RolePermissionItem[]>(
      `${this.baseUrl}/roles/${roleId}/permissions`,
    );
  }

  setRolePermissions(
    roleId: string,
    permissionIds: string[],
  ): Observable<RolePermissionItem[]> {
    return this.http.patch<RolePermissionItem[]>(
      `${this.baseUrl}/roles/${roleId}/permissions`,
      { permissionIds },
    );
  }
}
