package com.example.studentmanagement.dto.enrollment;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EnrollmentRequest {

    @NotNull(message = "Ders ID zorunludur")
    private Long courseId;
}
