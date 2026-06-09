package com.gymmanagement.gym_management.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class WorkoutPlanRequest {
    @NotNull
    private Long memberId;
    @NotBlank
    private String title;
    private String description;
    private String exercises;
    private LocalDate startDate;
    private LocalDate endDate;
}
