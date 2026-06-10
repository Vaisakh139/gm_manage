package com.gymmanagement.gym_management.dto.admin;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private boolean active;
    private boolean passwordChanged;
    private LocalDateTime createdAt;
}
