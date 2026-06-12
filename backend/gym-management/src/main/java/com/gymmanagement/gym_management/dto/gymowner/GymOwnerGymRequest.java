package com.gymmanagement.gym_management.dto.gymowner;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** Used by a gym owner to create or update one of their own gyms. */
@Data
public class GymOwnerGymRequest {
    @NotBlank(message = "Gym name is required")
    private String gymName;
    private String address;
    private String phone;
}
