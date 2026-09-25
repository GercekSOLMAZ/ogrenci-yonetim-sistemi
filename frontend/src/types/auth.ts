export enum Role {
  ADMIN = 'ADMIN',
  LECTURER = 'LECTURER',
  STUDENT = 'STUDENT',
}

export interface User {
  id: number;
  email: string;
  role: Role;
  firstName?: string;
  lastName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  dateOfBirth?: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: Role;
}
