package com.gymmanagement.gym_management.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class MemberRequest {
    @NotBlank @Email
    private String email;
    private String password;
    @NotBlank
    private String firstName;
    @NotBlank
    private String lastName;
    private String phone;
    private String address;
    private Long membershipPlanId;
    private LocalDate joinDate;
    private LocalDate membershipExpiry;
}
