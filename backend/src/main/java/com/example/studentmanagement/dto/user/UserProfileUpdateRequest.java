package com.example.studentmanagement.dto.user;

import jakarta.validation.constraints.Email;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UserProfileUpdateRequest {
    private String firstName;
    private String lastName;

    @Email(message = "Geçersiz e-posta biçimi")
    private String email;

    private String password;
    private String phone;
    private LocalDate dateOfBirth;
}
