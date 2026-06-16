package com.gymmanagement.gym_management.service;

import com.gymmanagement.gym_management.dto.plan.MembershipPlanRequest;
import com.gymmanagement.gym_management.dto.plan.MembershipPlanResponse;
import com.gymmanagement.gym_management.entity.*;
import com.gymmanagement.gym_management.exception.BusinessException;
import com.gymmanagement.gym_management.exception.ResourceNotFoundException;
import com.gymmanagement.gym_management.mapper.MembershipPlanMapper;
import com.gymmanagement.gym_management.repository.GymRepository;
import com.gymmanagement.gym_management.repository.MemberRepository;
import com.gymmanagement.gym_management.repository.MembershipPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MembershipPlanService {

    private final MembershipPlanRepository planRepository;
    private final GymRepository gymRepository;
    private final MemberRepository memberRepository;
    private final MembershipPlanMapper planMapper;

    // ── Gym Owner ─────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<MembershipPlanResponse> getPlansForGym(Long gymId, Long ownerId) {
        validateOwnership(gymId, ownerId);
        return planRepository.findByGymIdOrderByCreatedAtDesc(gymId)
                .stream().map(planMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public MembershipPlanResponse getPlanById(Long planId, Long ownerId) {
        MembershipPlan plan = findPlan(planId);
        validateOwnership(plan.getGym().getId(), ownerId);
        return planMapper.toResponse(plan);
    }

    @Transactional
    public MembershipPlanResponse createPlan(Long gymId, Long ownerId, MembershipPlanRequest request) {
        Gym gym = findGymAndValidateOwnership(gymId, ownerId);

        MembershipPlan plan = planMapper.toEntity(request);
        plan.setGym(gym);
        plan.setActive(true);
        plan = planRepository.save(plan);

        log.info("[PLAN] Created | planId={} name='{}' gymId={}", plan.getId(), plan.getName(), gymId);
        return planMapper.toResponse(plan);
    }

    @Transactional
    public MembershipPlanResponse updatePlan(Long planId, Long ownerId, MembershipPlanRequest request) {
        MembershipPlan plan = findPlan(planId);
        validateOwnership(plan.getGym().getId(), ownerId);

        planMapper.update(request, plan);
        plan = planRepository.save(plan);

        log.info("[PLAN] Updated | planId={} name='{}'", planId, plan.getName());
        return planMapper.toResponse(plan);
    }

    @Transactional
    public void deletePlan(Long planId, Long ownerId) {
        MembershipPlan plan = findPlan(planId);
        validateOwnership(plan.getGym().getId(), ownerId);

        log.info("[PLAN] Deleted | planId={} name='{}'", planId, plan.getName());
        planRepository.delete(plan);
    }

    @Transactional
    public MembershipPlanResponse toggleActive(Long planId, Long ownerId, boolean active) {
        MembershipPlan plan = findPlan(planId);
        validateOwnership(plan.getGym().getId(), ownerId);

        plan.setActive(active);
        plan = planRepository.save(plan);

        log.info("[PLAN] {} | planId={}", active ? "Activated" : "Deactivated", planId);
        return planMapper.toResponse(plan);
    }

    // ── Member (read-only: active plans for their gym) ────────

    @Transactional(readOnly = true)
    public List<MembershipPlanResponse> getActivePlansForMember(Long userId) {
        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member profile not found"));
        return planRepository.findByGymIdAndActiveTrueOrderByPriceAsc(member.getGym().getId())
                .stream().map(planMapper::toResponse).toList();
    }

    // ── Admin ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<MembershipPlanResponse> getAllPlans() {
        return planRepository.findAll().stream().map(planMapper::toResponse).toList();
    }

    // ── Helpers ───────────────────────────────────────────────

    private MembershipPlan findPlan(Long id) {
        return planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membership plan not found: " + id));
    }

    private Gym findGymAndValidateOwnership(Long gymId, Long ownerId) {
        return gymRepository.findByIdAndOwnerId(gymId, ownerId)
                .orElseThrow(() -> new BusinessException("Gym not found or does not belong to you"));
    }

    private void validateOwnership(Long gymId, Long ownerId) {
        gymRepository.findByIdAndOwnerId(gymId, ownerId)
                .orElseThrow(() -> new BusinessException("This plan does not belong to one of your gyms"));
    }
}
