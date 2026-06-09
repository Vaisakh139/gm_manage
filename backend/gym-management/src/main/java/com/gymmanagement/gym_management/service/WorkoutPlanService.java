package com.gymmanagement.gym_management.service;

import com.gymmanagement.gym_management.dto.WorkoutPlanRequest;
import com.gymmanagement.gym_management.dto.WorkoutPlanResponse;
import com.gymmanagement.gym_management.model.*;
import com.gymmanagement.gym_management.repository.MemberRepository;
import com.gymmanagement.gym_management.repository.TrainerRepository;
import com.gymmanagement.gym_management.repository.WorkoutPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkoutPlanService {

    private final WorkoutPlanRepository workoutPlanRepository;
    private final MemberRepository memberRepository;
    private final TrainerRepository trainerRepository;

    @Transactional(readOnly = true)
    public List<WorkoutPlanResponse> getAll() {
        return workoutPlanRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkoutPlanResponse> getByTrainer(Long trainerId) {
        return workoutPlanRepository.findByTrainerId(trainerId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkoutPlanResponse> getByMember(Long memberId) {
        return workoutPlanRepository.findByMemberId(memberId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WorkoutPlanResponse getById(Long id) {
        return toResponse(workoutPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout plan not found")));
    }

    @Transactional
    public WorkoutPlanResponse create(Long trainerId, WorkoutPlanRequest req) {
        Trainer trainer = trainerRepository.findById(trainerId)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));
        Member member = memberRepository.findById(req.getMemberId())
                .orElseThrow(() -> new RuntimeException("Member not found"));

        WorkoutPlan plan = WorkoutPlan.builder()
                .trainer(trainer)
                .member(member)
                .title(req.getTitle())
                .description(req.getDescription())
                .exercises(req.getExercises())
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .active(true)
                .build();

        return toResponse(workoutPlanRepository.save(plan));
    }

    @Transactional
    public WorkoutPlanResponse update(Long id, WorkoutPlanRequest req) {
        WorkoutPlan plan = workoutPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout plan not found"));

        plan.setTitle(req.getTitle());
        plan.setDescription(req.getDescription());
        plan.setExercises(req.getExercises());
        plan.setStartDate(req.getStartDate());
        plan.setEndDate(req.getEndDate());

        return toResponse(workoutPlanRepository.save(plan));
    }

    @Transactional
    public void delete(Long id) {
        WorkoutPlan plan = workoutPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout plan not found"));
        plan.setActive(false);
        workoutPlanRepository.save(plan);
    }

    private WorkoutPlanResponse toResponse(WorkoutPlan w) {
        WorkoutPlanResponse r = new WorkoutPlanResponse();
        r.setId(w.getId());
        r.setTrainerId(w.getTrainer().getId());
        r.setTrainerName(w.getTrainer().getFirstName() + " " + w.getTrainer().getLastName());
        r.setMemberId(w.getMember().getId());
        r.setMemberName(w.getMember().getFirstName() + " " + w.getMember().getLastName());
        r.setTitle(w.getTitle());
        r.setDescription(w.getDescription());
        r.setExercises(w.getExercises());
        r.setStartDate(w.getStartDate());
        r.setEndDate(w.getEndDate());
        r.setActive(w.isActive());
        return r;
    }
}
