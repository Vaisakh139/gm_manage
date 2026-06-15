package com.gymmanagement.gym_management.dto.gymowner;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Aggregated dashboard across ALL gyms owned by the current GYM_OWNER,
 * plus a per-gym breakdown.
 */
@Data @Builder
public class GymOwnerDashboardResponse {

    // Members
    private long totalGyms;
    private long totalMembers;
    private long activeMembers;
    private long inactiveMembers;
    private long expiredMembers;

    // Equipment (aggregated across all owned gyms)
    private long totalEquipments;
    private long availableEquipments;
    private long outOfServiceEquipments;

    /** Per-gym breakdown — one entry per gym branch */
    private List<GymStat> gymStats;

    @Data @Builder
    public static class GymStat {
        private Long gymId;
        private String gymName;
        private String address;
        private long totalMembers;
        private long activeMembers;
        private long totalEquipments;
        private long availableEquipments;
    }
}
