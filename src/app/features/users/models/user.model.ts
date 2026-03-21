import type { Role } from '../../permissions/models/role.model';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleIds: Role[];
  tutorIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  roleIds: string[];
  tutorIds?: string[];
}

export type UpdateUserDto = Partial<CreateUserDto>;
