package com.gymmanagement.gym_management.controller;

import com.gymmanagement.gym_management.dto.ApiResponse;
import com.gymmanagement.gym_management.dto.plan.MembershipPlanRequest;
import com.gymmanagement.gym_management.dto.plan.MembershipPlanResponse;
import com.gymmanagement.gym_management.entity.User;
import com.gymmanagement.gym_management.service.MembershipPlanService;
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
public class MembershipPlanController {

    private final MembershipPlanService planService;

    // ── Admin ─────────────────────────────────────────────────

    @GetMapping("/api/admin/plans")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<MembershipPlanResponse>>> adminGetAll() {
        return ResponseEntity.ok(ApiResponse.ok("Plans fetched", planService.getAllPlans()));
    }

    // ── Gym Owner ─────────────────────────────────────────────

    /** List all plans for a specific gym branch */
    @GetMapping("/api/owner/plans")
    @PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
    public ResponseEntity<ApiResponse<List<MembershipPlanResponse>>> getPlans(
            @AuthenticationPrincipal User user,
            @RequestParam Long gymId) {
        return ResponseEntity.ok(ApiResponse.ok("Plans fetched",
                planService.getPlansForGym(gymId, user.getId())));
    }

    @GetMapping("/api/owner/plans/{id}")
    @PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
    public ResponseEntity<ApiResponse<MembershipPlanResponse>> getPlan(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Plan fetched",
                planService.getPlanById(id, user.getId())));
    }

    @PostMapping("/api/owner/plans")
    @PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
    public ResponseEntity<ApiResponse<MembershipPlanResponse>> createPlan(
            @AuthenticationPrincipal User user,
            @RequestParam Long gymId,
            @Valid @RequestBody MembershipPlanRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Plan created",
                planService.createPlan(gymId, user.getId(), request)));
    }

    @PutMapping("/api/owner/plans/{id}")
    @PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
    public ResponseEntity<ApiResponse<MembershipPlanResponse>> updatePlan(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody MembershipPlanRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Plan updated",
                planService.updatePlan(id, user.getId(), request)));
    }

    @DeleteMapping("/api/owner/plans/{id}")
    @PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
    public ResponseEntity<ApiResponse<Void>> deletePlan(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        planService.deletePlan(id, user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Plan deleted"));
    }

    /** Activate or deactivate a plan — PATCH /api/owner/plans/{id}/status */
    @PatchMapping("/api/owner/plans/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
    public ResponseEntity<ApiResponse<MembershipPlanResponse>> toggleStatus(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        boolean active = body.getOrDefault("active", true);
        return ResponseEntity.ok(ApiResponse.ok(
                active ? "Plan activated" : "Plan deactivated",
                planService.toggleActive(id, user.getId(), active)));
    }

    // ── Member ────────────────────────────────────────────────

    /** Active plans available in the member's gym */
    @GetMapping("/api/member/plans")
    @PreAuthorize("hasAuthority('ROLE_MEMBER')")
    public ResponseEntity<ApiResponse<List<MembershipPlanResponse>>> getMemberPlans(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok("Plans fetched",
                planService.getActivePlansForMember(user.getId())));
    }
}
