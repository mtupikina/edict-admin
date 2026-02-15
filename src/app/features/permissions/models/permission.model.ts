export interface Permission {
  _id: string;
  name: string;
  resource?: string;
  action?: string;
  description?: string;
}

export interface CreatePermissionDto {
  name: string;
  resource?: string;
  action?: string;
  description?: string;
}

export type UpdatePermissionDto = Partial<CreatePermissionDto>;

export interface RolePermissionItem {
  permissionId: string;
  name: string;
}
