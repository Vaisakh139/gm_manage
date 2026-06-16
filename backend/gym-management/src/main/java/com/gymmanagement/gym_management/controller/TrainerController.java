package com.gymmanagement.gym_management.controller;

import com.gymmanagement.gym_management.dto.ApiResponse;
import com.gymmanagement.gym_management.dto.gymowner.MemberResponse;
import com.gymmanagement.gym_management.dto.trainer.TrainerRequest;
import com.gymmanagement.gym_management.dto.trainer.TrainerResponse;
import com.gymmanagement.gym_management.entity.User;
import com.gymmanagement.gym_management.service.TrainerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class TrainerController {

    private final TrainerService trainerService;

    // ── Admin ─────────────────────────────────────────────────

    @GetMapping("/api/admin/trainers")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<TrainerResponse>>> adminGetAll() {
        return ResponseEntity.ok(ApiResponse.ok("Trainers fetched", trainerService.getAllTrainers()));
    }

    // ── Gym Owner ─────────────────────────────────────────────

    @GetMapping("/api/owner/trainers")
    @PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
    public ResponseEntity<ApiResponse<List<TrainerResponse>>> getTrainers(
            @AuthenticationPrincipal User user,
            @RequestParam Long gymId) {
        return ResponseEntity.ok(ApiResponse.ok("Trainers fetched",
                trainerService.getTrainersForGym(gymId, user.getId())));
    }

    @GetMapping("/api/owner/trainers/{id}")
    @PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
    public ResponseEntity<ApiResponse<TrainerResponse>> getTrainer(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Trainer fetched",
                trainerService.getTrainerById(id, user.getId())));
    }

    @PostMapping("/api/owner/trainers")
    @PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
    public ResponseEntity<ApiResponse<TrainerResponse>> createTrainer(
            @AuthenticationPrincipal User user,
            @RequestParam Long gymId,
            @Valid @RequestBody TrainerRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Trainer created",
                trainerService.createTrainer(gymId, user.getId(), request)));
    }

    @PutMapping("/api/owner/trainers/{id}")
    @PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
    public ResponseEntity<ApiResponse<TrainerResponse>> updateTrainer(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody TrainerRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Trainer updated",
                trainerService.updateTrainer(id, user.getId(), request)));
    }

    @DeleteMapping("/api/owner/trainers/{id}")
    @PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
    public ResponseEntity<ApiResponse<Void>> deleteTrainer(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        trainerService.deleteTrainer(id, user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Trainer deleted"));
    }

    @PatchMapping("/api/owner/trainers/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
    public ResponseEntity<ApiResponse<TrainerResponse>> toggleStatus(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        boolean active = body.getOrDefault("active", true);
        return ResponseEntity.ok(ApiResponse.ok(
                active ? "Trainer activated" : "Trainer deactivated",
                trainerService.toggleActive(id, user.getId(), active)));
    }

    // ── Member assignment ─────────────────────────────────────

    @GetMapping("/api/owner/trainers/{id}/members")
    @PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
    public ResponseEntity<ApiResponse<List<MemberResponse>>> getAssignedMembers(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Assigned members fetched",
                trainerService.getAssignedMembers(id, user.getId())));
    }

    @PostMapping("/api/owner/trainers/{id}/members/{memberId}")
    @PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
    public ResponseEntity<ApiResponse<MemberResponse>> assignMember(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @PathVariable Long memberId) {
        return ResponseEntity.ok(ApiResponse.ok("Member assigned",
                trainerService.assignMember(id, memberId, user.getId())));
    }

    @DeleteMapping("/api/owner/trainers/{id}/members/{memberId}")
    @PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
    public ResponseEntity<ApiResponse<MemberResponse>> unassignMember(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @PathVariable Long memberId) {
        return ResponseEntity.ok(ApiResponse.ok("Member unassigned",
                trainerService.unassignMember(id, memberId, user.getId())));
    }

    // ── Member ────────────────────────────────────────────────

    @GetMapping("/api/member/trainer")
    @PreAuthorize("hasAuthority('ROLE_MEMBER')")
    public ResponseEntity<ApiResponse<TrainerResponse>> getMyTrainer(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok("Trainer fetched",
                trainerService.getMyTrainer(user.getId())));
    }
}
