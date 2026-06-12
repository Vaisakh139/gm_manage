package com.gymmanagement.gym_management.controller;

import com.gymmanagement.gym_management.dto.ApiResponse;
import com.gymmanagement.gym_management.dto.PageResponse;
import com.gymmanagement.gym_management.dto.admin.GymResponse;
import com.gymmanagement.gym_management.dto.gymowner.*;
import com.gymmanagement.gym_management.entity.User;
import com.gymmanagement.gym_management.service.GymOwnerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * All routes require ROLE_GYM_OWNER.
 * A gym owner can manage multiple gym branches under their account.
 */
@RestController
@PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
@RequiredArgsConstructor
public class GymOwnerController {

    private final GymOwnerService gymOwnerService;

    // ── My Gyms ───────────────────────────────────────────────

    /** List all gyms owned by the current user */
    @GetMapping("/api/gym-owner/gyms")
    public ResponseEntity<ApiResponse<List<GymResponse>>> getMyGyms(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(
                ApiResponse.ok("Gyms fetched", gymOwnerService.getMyGyms(user.getId())));
    }

    /** Create a new gym branch */
    @PostMapping("/api/gym-owner/gyms")
    public ResponseEntity<ApiResponse<GymResponse>> createGym(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody GymOwnerGymRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok("Gym created", gymOwnerService.createGym(user.getId(), request)));
    }

    /** Get a specific gym by id (must belong to current owner) */
    @GetMapping("/api/gym-owner/gyms/{gymId}")
    public ResponseEntity<ApiResponse<GymResponse>> getMyGym(
            @AuthenticationPrincipal User user,
            @PathVariable Long gymId) {
        return ResponseEntity.ok(
                ApiResponse.ok("Gym fetched", gymOwnerService.getGymById(gymId, user.getId())));
    }

    /** Update a specific gym */
    @PutMapping("/api/gym-owner/gyms/{gymId}")
    public ResponseEntity<ApiResponse<GymResponse>> updateMyGym(
            @AuthenticationPrincipal User user,
            @PathVariable Long gymId,
            @Valid @RequestBody GymOwnerGymRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok("Gym updated", gymOwnerService.updateGym(gymId, user.getId(), request)));
    }

    // ── Dashboard ─────────────────────────────────────────────

    /** Aggregate stats + per-gym breakdown across all owned gyms */
    @GetMapping("/api/gym-owner/dashboard")
    public ResponseEntity<ApiResponse<GymOwnerDashboardResponse>> getDashboard(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(
                ApiResponse.ok("Dashboard data", gymOwnerService.getDashboard(user.getId())));
    }

    // ── Members ───────────────────────────────────────────────

    /** List members of a specific gym branch */
    @GetMapping("/api/members")
    public ResponseEntity<ApiResponse<PageResponse<MemberResponse>>> getMembers(
            @AuthenticationPrincipal User user,
            @RequestParam Long gymId,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok("Members fetched",
                gymOwnerService.getMembers(gymId, user.getId(), search, page, size)));
    }

    /** Get a single member (validates ownership) */
    @GetMapping("/api/members/{id}")
    public ResponseEntity<ApiResponse<MemberResponse>> getMember(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Member fetched",
                gymOwnerService.getMember(id, user.getId())));
    }

    /** Add a member — request body must include gymId */
    @PostMapping("/api/members")
    public ResponseEntity<ApiResponse<MemberResponse>> addMember(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody MemberRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Member added",
                gymOwnerService.addMember(request.getGymId(), user.getId(), request)));
    }

    @PutMapping("/api/members/{id}")
    public ResponseEntity<ApiResponse<MemberResponse>> updateMember(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody MemberRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Member updated",
                gymOwnerService.updateMember(id, user.getId(), request)));
    }

    @DeleteMapping("/api/members/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMember(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        gymOwnerService.deleteMember(id, user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Member deleted"));
    }
}
