package com.example.studentmanagement.controller;

import com.example.studentmanagement.dto.student.StudentResponse;
import com.example.studentmanagement.entity.EnrollmentStatus;
import com.example.studentmanagement.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @GetMapping
    public ResponseEntity<List<StudentResponse>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/me")
    public ResponseEntity<StudentResponse> getCurrentStudent() {
        return ResponseEntity.ok(studentService.getCurrentStudent());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentResponse> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<StudentResponse> updateEnrollmentStatus(
            @PathVariable Long id, 
            @RequestParam EnrollmentStatus status) {
        return ResponseEntity.ok(studentService.updateEnrollmentStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }
}
