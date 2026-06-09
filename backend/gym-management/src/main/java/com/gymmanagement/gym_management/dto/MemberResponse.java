package com.gymmanagement.gym_management.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class MemberResponse {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String address;
    private Long membershipPlanId;
    private String membershipPlanName;
    private LocalDate joinDate;
    private LocalDate membershipExpiry;
    private boolean active;
}
