export interface CourseRequest {
  courseName: string;
  courseCode: string;
  description?: string;
}

export interface CourseResponse {
  id: number;
  courseName: string;
  courseCode: string;
  description?: string;
  createdAt: string;
}
