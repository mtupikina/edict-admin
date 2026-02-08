export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

export type UpdateUserDto = Partial<CreateUserDto>;
