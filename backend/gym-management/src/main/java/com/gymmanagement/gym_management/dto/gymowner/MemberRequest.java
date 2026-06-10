package com.gymmanagement.gym_management.dto.gymowner;

import com.gymmanagement.gym_management.entity.MemberStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class MemberRequest {
    @NotBlank
    private String fullName;
    @NotBlank @Email
    private String email;
    private String phone;
    private String membershipPlan;
    private LocalDate startDate;
    private LocalDate endDate;
    private MemberStatus status;
}
