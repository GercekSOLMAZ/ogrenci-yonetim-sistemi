package com.example.studentmanagement.dto.course;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CourseRequest {

    @NotBlank(message = "Ders adı zorunludur")
    private String courseName;

    @NotBlank(message = "Ders kodu zorunludur")
    private String courseCode;

    private String description;
}
