package com.gymmanagement.gym_management.repository;

import com.gymmanagement.gym_management.model.Trainer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TrainerRepository extends JpaRepository<Trainer, Long> {
    List<Trainer> findByActiveTrue();
    Optional<Trainer> findByUserId(Long userId);
    long countByActiveTrue();
}
