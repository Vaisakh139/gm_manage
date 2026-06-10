package com.gymmanagement.gym_management.dto.admin;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class GymResponse {
    private Long id;
    private String gymName;
    private String address;
    private String phone;
    private Long ownerId;
    private String ownerName;
    private String ownerEmail;
    private boolean ownerActive;
    private LocalDateTime createdAt;
}
