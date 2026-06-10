package com.gymmanagement.gym_management.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** Used by admin to create a new gym (also creates the GYM_OWNER account) */
@Data
public class GymRequest {
    @NotBlank
    private String gymName;
    private String address;
    private String phone;

    // Owner details — only required on CREATE
    @NotBlank
    private String ownerName;
    @NotBlank @Email
    private String ownerEmail;
    private String ownerPhone;
}
