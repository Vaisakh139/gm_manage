package com.gymmanagement.gym_management.dto.plan;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class MembershipPlanResponse {
    private Long id;
    private String name;
    private String description;
    private Integer durationInMonths;
    private BigDecimal price;
    private boolean active;
    private Long gymId;
    private String gymName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
