package com.gymmanagement.gym_management.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PlanResponse {
    private Long id;
    private String name;
    private String description;
    private int durationMonths;
    private BigDecimal price;
    private boolean active;
}
