package com.example.studentmanagement.service;

import com.example.studentmanagement.dto.student.StudentResponse;
import com.example.studentmanagement.entity.EnrollmentStatus;
import com.example.studentmanagement.entity.Role;
import com.example.studentmanagement.entity.User;
import com.example.studentmanagement.exception.BadRequestException;
import com.example.studentmanagement.exception.ResourceNotFoundException;
import com.example.studentmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final UserRepository userRepository;

    public List<StudentResponse> getAllStudents() {
        return userRepository.findByRole(Role.STUDENT).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public StudentResponse getCurrentStudent() {
        return mapToResponse(getCurrentStudentEntity());
    }

    public StudentResponse getStudentById(Long id) {
        User user = userRepository.findById(id)
                .filter(u -> u.getRole() == Role.STUDENT)
                .orElseThrow(() -> new ResourceNotFoundException("Öğrenci bulunamadı, id: " + id));
        return mapToResponse(user);
    }

    public StudentResponse updateEnrollmentStatus(Long id, EnrollmentStatus status) {
        User user = userRepository.findById(id)
                .filter(u -> u.getRole() == Role.STUDENT)
                .orElseThrow(() -> new ResourceNotFoundException("Öğrenci bulunamadı, id: " + id));
        
        user.setEnrollmentStatus(status);
        return mapToResponse(userRepository.save(user));
    }

    public void deleteStudent(Long id) {
        User user = userRepository.findById(id)
                .filter(u -> u.getRole() == Role.STUDENT)
                .orElseThrow(() -> new ResourceNotFoundException("Öğrenci bulunamadı, id: " + id));
        userRepository.delete(user);
    }

    private User getCurrentStudentEntity() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadRequestException("Kullanıcı oturum açmamış.");
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Bu e-posta ile kullanıcı bulunamadı: " + email));

        if (user.getRole() != Role.STUDENT) {
            throw new BadRequestException("Bu kaynağa yalnızca öğrenciler erişebilir.");
        }

        return user;
    }

    private StudentResponse mapToResponse(User user) {
        return StudentResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .dateOfBirth(user.getDateOfBirth())
                .enrollmentStatus(user.getEnrollmentStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
