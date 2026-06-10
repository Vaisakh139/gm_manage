package com.gymmanagement.gym_management.dto.member;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @NotBlank
    private String name;
    private String phone;
}
