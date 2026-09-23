# Student Management System – API Endpoints

This document outlines the available REST API endpoints for the Student Management System. Use these samples to test the APIs through Postman.

## Base URL
`http://localhost:8080`

---

## 1. Authentication API
Endpoints for user registration and login. No authentication required.

| Method | Endpoint | Description | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | `RegisterRequest` | `String` |
| `POST` | `/api/auth/login` | Login to get JWT token | `LoginRequest` | `AuthResponse` |

### `RegisterRequest` (Student)
```json
{
  "firstName": "Kasun",
  "lastName": "Udara",
  "email": "Kasun@example.com",
  "password": "password123",
  "role": "STUDENT",
  "phone": "1234567890",
  "dateOfBirth": "2000-01-01"
}
```

### `RegisterRequest` (Admin)
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "ADMIN",
  "phone": "1234567890",
  "dateOfBirth": "2000-01-01"
}
```

### `LoginRequest`
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### `AuthResponse`
```json
{
  "token": "eyJhbG...",
  "email": "john@example.com",
  "role": "ADMIN"
}
```

---

## 2. Students API
Endpoints for managing student records. Requires `Authorization: Bearer <token>`.

| Method | Endpoint | Description | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/students` | Get all students | - | `List<StudentResponse>` |
| `GET` | `/api/students/me` | Get current student's details | - | `StudentResponse` |
| `GET` | `/api/students/{id}` | Get student by ID | - | `StudentResponse` |
| `PATCH` | `/api/students/{id}/status` | Update enrollment status | `status` (query param) | `StudentResponse` |
| `DELETE` | `/api/students/{id}` | Delete a student | - | `204 No Content` |

### `PATCH /api/students/{id}/status` Example
Update student status to `APPROVED`.
- **URL**: `http://localhost:8080/api/students/1/status?status=APPROVED`
- **Method**: `PATCH`

### `StudentResponse`
```json
{
  "id": 1,
  "firstName": "Kasun",
  "lastName": "Udara",
  "email": "Kasun@example.com",
  "phone": "1234567890",
  "dateOfBirth": "2000-01-01",
  "enrollmentStatus": "APPROVED", 
  "createdAt": "2024-03-24T12:00:00"
}
```

---

## 3. Courses API
Endpoints for managing courses. Requires `Authorization: Bearer <token>`.

| Method | Endpoint | Description | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/courses` | Get all courses | - | `List<CourseResponse>` |
| `GET` | `/api/courses/{id}` | Get course by ID | - | `CourseResponse` |
| `POST` | `/api/courses` | Create a new course | `CourseRequest` | `CourseResponse` |
| `PUT` | `/api/courses/{id}` | Update an existing course | `CourseRequest` | `CourseResponse` |
| `DELETE` | `/api/courses/{id}` | Delete a course | - | `204 No Content` |

### `POST /api/courses` Example (Create)
```json
{
  "courseName": "Advanced Java",
  "courseCode": "CS102",
  "description": "Deep dive into Spring Boot and JPA"
}
```

### `PUT /api/courses/{id}` Example (Update)
Update course with ID `1`.
- **URL**: `http://localhost:8080/api/courses/1`
- **Method**: `PUT`
- **Body**:
```json
{
  "courseName": "Advanced Java Programming",
  "courseCode": "CS102-UP",
  "description": "Updated course content with Microservices"
}
```

### `CourseResponse`
```json
{
  "id": 1,
  "courseName": "Advanced Java Programming",
  "courseCode": "CS102-UP",
  "description": "Updated course content with Microservices",
  "createdAt": "2024-03-24T12:00:00"
}
```

---

## 4. Enrollments API
Student self-enrollment endpoints. Requires `Authorization: Bearer <token>`.

| Method | Endpoint | Description | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/enrollments` | Enroll current student in a course | `EnrollmentRequest` | `EnrollmentResponse` |
| `GET` | `/api/enrollments/me` | Get current student's enrollments | - | `List<EnrollmentResponse>` |
| `GET` | `/api/enrollments/student/{studentId}` | Get enrollments by student ID (Admin/Lecturer) | - | `List<EnrollmentResponse>` |

### `EnrollmentRequest`
```json
{
  "courseId": 1
}
```

### `EnrollmentResponse`
```json
{
  "id": 10,
  "studentId": 5,
  "courseId": 1,
  "courseName": "Advanced Java Programming",
  "courseCode": "CS102-UP",
  "enrolledAt": "2024-03-24T12:00:00"
}
```

---

## 5. User Profile API
Endpoints for current user profile. Requires `Authorization: Bearer <token>`.

| Method | Endpoint | Description | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/users/me` | Get current user's profile | - | `UserProfileResponse` |
| `PUT` | `/api/users/me` | Update current user's profile | `UserProfileUpdateRequest` | `UserProfileResponse` |

### `UserProfileUpdateRequest`
```json
{
  "firstName": "Kasun",
  "lastName": "Udara",
  "email": "kasun@example.com",
  "password": "newPassword123",
  "phone": "1234567890",
  "dateOfBirth": "2000-01-01"
}
```

### `UserProfileResponse`
```json
{
  "id": 5,
  "firstName": "Kasun",
  "lastName": "Udara",
  "email": "kasun@example.com",
  "phone": "1234567890",
  "dateOfBirth": "2000-01-01"
}
```
