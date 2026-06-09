package com.gymmanagement.gym_management.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class WorkoutPlanResponse {
    private Long id;
    private Long trainerId;
    private String trainerName;
    private Long memberId;
    private String memberName;
    private String title;
    private String description;
    private String exercises;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean active;
}
