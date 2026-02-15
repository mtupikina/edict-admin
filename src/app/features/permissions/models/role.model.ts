export interface Role {
  _id: string;
  name: string;
  description?: string;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
}

export type UpdateRoleDto = Partial<CreateRoleDto>;
