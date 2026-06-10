package com.gymmanagement.gym_management.dto.gymowner;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class GymOwnerDashboardResponse {
    private long totalMembers;
    private long activeMembers;
    private long inactiveMembers;
    private long expiredMembers;
    private String gymName;
}
