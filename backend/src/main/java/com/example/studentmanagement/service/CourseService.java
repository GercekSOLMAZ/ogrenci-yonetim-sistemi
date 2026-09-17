package com.example.studentmanagement.service;

import com.example.studentmanagement.dto.course.CourseRequest;
import com.example.studentmanagement.dto.course.CourseResponse;
import com.example.studentmanagement.entity.Course;
import com.example.studentmanagement.exception.BadRequestException;
import com.example.studentmanagement.exception.ResourceNotFoundException;
import com.example.studentmanagement.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;

    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CourseResponse getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ders bulunamadı, id: " + id));
        return mapToResponse(course);
    }

    public CourseResponse createCourse(CourseRequest request) {
        if (courseRepository.findByCourseCode(request.getCourseCode()).isPresent()) {
            throw new BadRequestException("Bu ders kodu zaten mevcut");
        }

        Course course = Course.builder()
                .courseName(request.getCourseName())
                .courseCode(request.getCourseCode())
                .description(request.getDescription())
                .build();

        return mapToResponse(courseRepository.save(course));
    }

    public CourseResponse updateCourse(Long id, CourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ders bulunamadı, id: " + id));

        // Check if course code is being changed and if it already exists
        if (!course.getCourseCode().equals(request.getCourseCode()) && 
            courseRepository.findByCourseCode(request.getCourseCode()).isPresent()) {
            throw new BadRequestException("Bu ders kodu zaten mevcut");
        }

        course.setCourseName(request.getCourseName());
        course.setCourseCode(request.getCourseCode());
        course.setDescription(request.getDescription());

        return mapToResponse(courseRepository.save(course));
    }

    public void deleteCourse(Long id) {
        if (!courseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Ders bulunamadı, id: " + id);
        }
        courseRepository.deleteById(id);
    }

    private CourseResponse mapToResponse(Course course) {
        return CourseResponse.builder()
                .id(course.getId())
                .courseName(course.getCourseName())
                .courseCode(course.getCourseCode())
                .description(course.getDescription())
                .createdAt(course.getCreatedAt())
                .build();
    }
}
