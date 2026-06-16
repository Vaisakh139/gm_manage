package com.gymmanagement.gym_management.dto.trainer;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class TrainerRequest {

    @NotBlank(message = "Trainer name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    private String phone;
    private String email;

    @Size(max = 100)
    private String specialization;

    @Min(value = 0, message = "Experience must be >= 0")
    private Integer experienceYears;

    private String imageUrl;
}
