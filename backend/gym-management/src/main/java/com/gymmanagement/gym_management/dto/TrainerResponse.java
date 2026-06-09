package com.gymmanagement.gym_management.dto;

import lombok.Data;

@Data
public class TrainerResponse {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String specialization;
    private String bio;
    private boolean active;
}
