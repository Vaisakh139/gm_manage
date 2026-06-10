package com.gymmanagement.gym_management.dto.pub;

import lombok.Builder;
import lombok.Data;

/**
 * Gym data that is safe to expose to unauthenticated users on the public landing page.
 * Excludes any sensitive or internal information.
 */
@Data
@Builder
public class GymPublicResponse {
    private Long id;
    private String gymName;
    private String address;
    private String phone;
    private String ownerName;
    private long totalMembers;
}
