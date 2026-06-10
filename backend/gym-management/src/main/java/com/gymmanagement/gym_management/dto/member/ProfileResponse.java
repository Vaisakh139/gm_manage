package com.gymmanagement.gym_management.dto.member;

import com.gymmanagement.gym_management.entity.MemberStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data @Builder
public class ProfileResponse {
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private String gymName;
    private String membershipPlan;
    private LocalDate startDate;
    private LocalDate endDate;
    private MemberStatus memberStatus;
}
