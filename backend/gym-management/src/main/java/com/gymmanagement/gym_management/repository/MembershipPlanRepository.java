package com.gymmanagement.gym_management.repository;

import com.gymmanagement.gym_management.entity.MembershipPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MembershipPlanRepository extends JpaRepository<MembershipPlan, Long> {

    List<MembershipPlan> findByGymIdOrderByCreatedAtDesc(Long gymId);

    List<MembershipPlan> findByGymIdAndActiveTrueOrderByPriceAsc(Long gymId);

    Optional<MembershipPlan> findByIdAndGymId(Long id, Long gymId);

    long countByGymId(Long gymId);

    long countByGymIdAndActiveTrue(Long gymId);
}
