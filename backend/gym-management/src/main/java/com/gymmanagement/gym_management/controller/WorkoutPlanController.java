package com.gymmanagement.gym_management.controller;

import com.gymmanagement.gym_management.dto.WorkoutPlanRequest;
import com.gymmanagement.gym_management.dto.WorkoutPlanResponse;
import com.gymmanagement.gym_management.model.User;
import com.gymmanagement.gym_management.repository.MemberRepository;
import com.gymmanagement.gym_management.repository.TrainerRepository;
import com.gymmanagement.gym_management.service.WorkoutPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workout-plans")
@RequiredArgsConstructor
public class WorkoutPlanController {

    private final WorkoutPlanService workoutPlanService;
    private final TrainerRepository trainerRepository;
    private final MemberRepository memberRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<WorkoutPlanResponse>> getAll() {
        return ResponseEntity.ok(workoutPlanService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkoutPlanResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(workoutPlanService.getById(id));
    }

    @GetMapping("/trainer")
    @PreAuthorize("hasRole('TRAINER')")
    public ResponseEntity<List<WorkoutPlanResponse>> getMyPlans(@AuthenticationPrincipal User user) {
        Long trainerId = trainerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Trainer not found")).getId();
        return ResponseEntity.ok(workoutPlanService.getByTrainer(trainerId));
    }

    @GetMapping("/trainer/members")
    @PreAuthorize("hasRole('TRAINER')")
    public ResponseEntity<List<WorkoutPlanResponse>> getAssignedMembers(@AuthenticationPrincipal User user) {
        Long trainerId = trainerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Trainer not found")).getId();
        return ResponseEntity.ok(workoutPlanService.getByTrainer(trainerId));
    }

    @GetMapping("/member")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<List<WorkoutPlanResponse>> getMemberPlans(@AuthenticationPrincipal User user) {
        Long memberId = memberRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Member not found")).getId();
        return ResponseEntity.ok(workoutPlanService.getByMember(memberId));
    }

    @PostMapping
    @PreAuthorize("hasRole('TRAINER')")
    public ResponseEntity<WorkoutPlanResponse> create(@Valid @RequestBody WorkoutPlanRequest request,
                                                       @AuthenticationPrincipal User user) {
        Long trainerId = trainerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Trainer not found")).getId();
        return ResponseEntity.ok(workoutPlanService.create(trainerId, request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TRAINER', 'ADMIN')")
    public ResponseEntity<WorkoutPlanResponse> update(@PathVariable Long id,
                                                       @Valid @RequestBody WorkoutPlanRequest request) {
        return ResponseEntity.ok(workoutPlanService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TRAINER', 'ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        workoutPlanService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
