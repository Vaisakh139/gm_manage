package com.gymmanagement.gym_management.dto.admin;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class DashboardStatsResponse {
    private long totalGyms;
    private long totalGymOwners;
    private long activeGymOwners;
    private long totalMembers;
    private long activeMembers;
}
