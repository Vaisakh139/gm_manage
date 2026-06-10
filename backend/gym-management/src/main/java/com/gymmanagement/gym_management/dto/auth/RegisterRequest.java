package com.gymmanagement.gym_management.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Payload for gym owner self-registration from the public landing page.
 * Creates a GYM_OWNER user account + associated Gym in one transaction.
 */
@Data
public class RegisterRequest {

    @NotBlank(message = "Gym name is required")
    private String gymName;

    @NotBlank(message = "Owner name is required")
    private String ownerName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email address")
    private String email;

    private String phone;
    private String address;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
}
