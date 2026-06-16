package com.gymmanagement.gym_management.dto.gymowner;

import com.gymmanagement.gym_management.entity.MemberStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder
public class MemberResponse {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String membershipPlan;
    private LocalDate startDate;
    private LocalDate endDate;
    private MemberStatus status;
    private boolean active;
    private LocalDateTime createdAt;

    // Assigned trainer (nullable)
    private Long assignedTrainerId;
    private String assignedTrainerName;
}
