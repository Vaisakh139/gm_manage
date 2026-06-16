package com.gymmanagement.gym_management.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * A trainer working at a specific gym branch.
 * One gym can have many trainers; a trainer belongs to one gym.
 */
@Entity
@Table(name = "trainers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trainer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String name;

    private String phone;
    private String email;

    @Size(max = 100)
    private String specialization;

    private Integer experienceYears;

    private String imageUrl;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

    /** gym_id is nullable so Hibernate can add the column to existing tables safely */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gym_id", nullable = true)
    private Gym gym;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
