export interface UserProfileResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  dateOfBirth?: string | null;
}

export interface UserProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string | null;
  dateOfBirth?: string | null;
}
