export enum EnrollmentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface StudentResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  enrollmentStatus: EnrollmentStatus;
  createdAt: string;
}

export const enrollmentStatusLabels: Record<EnrollmentStatus, string> = {
  [EnrollmentStatus.PENDING]: 'Beklemede',
  [EnrollmentStatus.APPROVED]: 'Onaylandı',
  [EnrollmentStatus.REJECTED]: 'Reddedildi',
};
