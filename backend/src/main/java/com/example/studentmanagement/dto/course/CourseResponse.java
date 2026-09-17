package com.example.studentmanagement.dto.course;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CourseResponse {
    private Long id;
    private String courseName;
    private String courseCode;
    private String description;
    private LocalDateTime createdAt;
}
