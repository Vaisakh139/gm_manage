package com.gymmanagement.gym_management.repository;

import com.gymmanagement.gym_management.model.WorkoutPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkoutPlanRepository extends JpaRepository<WorkoutPlan, Long> {
    List<WorkoutPlan> findByTrainerId(Long trainerId);
    List<WorkoutPlan> findByMemberId(Long memberId);
    Optional<WorkoutPlan> findByMemberIdAndActiveTrue(Long memberId);
    List<WorkoutPlan> findByTrainerIdAndActiveTrue(Long trainerId);
}
