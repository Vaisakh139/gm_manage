package com.gymmanagement.gym_management.service;

import com.gymmanagement.gym_management.dto.PlanRequest;
import com.gymmanagement.gym_management.dto.PlanResponse;
import com.gymmanagement.gym_management.model.MembershipPlan;
import com.gymmanagement.gym_management.repository.MembershipPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MembershipPlanService {

    private final MembershipPlanRepository planRepository;

    @Transactional(readOnly = true)
    public List<PlanResponse> getAll() {
        return planRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PlanResponse> getActive() {
        return planRepository.findByActiveTrue().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PlanResponse getById(Long id) {
        return toResponse(planRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found")));
    }

    @Transactional
    public PlanResponse create(PlanRequest req) {
        MembershipPlan plan = MembershipPlan.builder()
                .name(req.getName())
                .description(req.getDescription())
                .durationMonths(req.getDurationMonths())
                .price(req.getPrice())
                .active(true)
                .build();
        return toResponse(planRepository.save(plan));
    }

    @Transactional
    public PlanResponse update(Long id, PlanRequest req) {
        MembershipPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        plan.setName(req.getName());
        plan.setDescription(req.getDescription());
        plan.setDurationMonths(req.getDurationMonths());
        plan.setPrice(req.getPrice());
        return toResponse(planRepository.save(plan));
    }

    @Transactional
    public void delete(Long id) {
        MembershipPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        plan.setActive(false);
        planRepository.save(plan);
    }

    private PlanResponse toResponse(MembershipPlan p) {
        PlanResponse r = new PlanResponse();
        r.setId(p.getId());
        r.setName(p.getName());
        r.setDescription(p.getDescription());
        r.setDurationMonths(p.getDurationMonths());
        r.setPrice(p.getPrice());
        r.setActive(p.isActive());
        return r;
    }
}
