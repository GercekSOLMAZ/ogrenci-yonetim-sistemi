export interface EnrollmentRequest {
  courseId: number;
}

export interface EnrollmentResponse {
  id: number;
  studentId: number;
  courseId: number;
  courseName: string;
  courseCode: string;
  enrolledAt: string;
}
