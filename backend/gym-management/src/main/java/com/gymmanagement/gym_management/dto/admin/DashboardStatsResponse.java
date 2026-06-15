package com.gymmanagement.gym_management.dto.admin;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class DashboardStatsResponse {
    // Members & gyms
    private long totalGyms;
    private long totalGymOwners;
    private long activeGymOwners;
    private long totalMembers;
    private long activeMembers;

    // Equipment statistics
    private long totalEquipments;
    private long availableEquipments;
    private long equipmentsUnderMaintenance;
}
