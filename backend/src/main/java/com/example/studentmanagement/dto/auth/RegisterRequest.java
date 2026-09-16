package com.example.studentmanagement.dto.auth;

import com.example.studentmanagement.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Ad zorunludur")
    private String firstName;

    @NotBlank(message = "Soyad zorunludur")
    private String lastName;

    @Email(message = "Geçersiz e-posta biçimi")
    @NotBlank(message = "E-posta zorunludur")
    private String email;

    @NotBlank(message = "Şifre zorunludur")
    private String password;

    @NotNull(message = "Rol zorunludur")
    private Role role;

    private String phone;

    private java.time.LocalDate dateOfBirth;
}
