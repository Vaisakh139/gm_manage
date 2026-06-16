package com.gymmanagement.gym_management.repository;

import com.gymmanagement.gym_management.entity.Trainer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TrainerRepository extends JpaRepository<Trainer, Long> {

    List<Trainer> findByGymIdOrderByNameAsc(Long gymId);

    List<Trainer> findByGymIdAndActiveTrueOrderByNameAsc(Long gymId);

    Optional<Trainer> findByIdAndGymId(Long id, Long gymId);

    long countByGymId(Long gymId);

    long countByGymIdAndActiveTrue(Long gymId);
}
