package com.gymmanagement.gym_management.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class DashboardStats {
    private long totalMembers;
    private long activeMembers;
    private long totalTrainers;
    private long activeTrainers;
    private long totalPayments;
    private long pendingPayments;
    private BigDecimal totalRevenue;
    private long activeWorkoutPlans;
}
