package com.gymmanagement.gym_management.dto.trainer;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TrainerResponse {
    private Long id;
    private String name;
    private String phone;
    private String email;
    private String specialization;
    private Integer experienceYears;
    private String imageUrl;
    private boolean active;
    private Long gymId;
    private String gymName;
    private long assignedMembersCount;
    private LocalDateTime createdAt;
}
