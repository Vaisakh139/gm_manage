package com.gymmanagement.gym_management.controller;

import com.gymmanagement.gym_management.dto.ApiResponse;
import com.gymmanagement.gym_management.dto.PageResponse;
import com.gymmanagement.gym_management.dto.gymowner.*;
import com.gymmanagement.gym_management.entity.Gym;
import com.gymmanagement.gym_management.entity.User;
import com.gymmanagement.gym_management.service.GymOwnerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * All routes in this controller require ROLE_GYM_OWNER.
 * Using hasAuthority('ROLE_GYM_OWNER') instead of hasRole('GYM_OWNER')
 * to be explicit and avoid any Spring Security prefix-handling ambiguity.
 */
@RestController
@PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
@RequiredArgsConstructor
public class GymOwnerController {

    private final GymOwnerService gymOwnerService;

    // ── Gym owner's own gym ──────────────────────────────────

    @GetMapping("/api/gym-owner/gym")
    public ResponseEntity<ApiResponse<Gym>> getMyGym(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok("Gym fetched", gymOwnerService.getGymByOwner(user.getId())));
    }

    @PutMapping("/api/gym-owner/gym")
    public ResponseEntity<ApiResponse<Gym>> updateMyGym(@AuthenticationPrincipal User user,
                                                         @RequestBody Map<String, String> body) {
        Gym gym = gymOwnerService.updateGym(
                user.getId(), body.get("gymName"), body.get("address"), body.get("phone"));
        return ResponseEntity.ok(ApiResponse.ok("Gym updated", gym));
    }

    @GetMapping("/api/gym-owner/dashboard")
    public ResponseEntity<ApiResponse<GymOwnerDashboardResponse>> getDashboard(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok("Dashboard data", gymOwnerService.getDashboard(user.getId())));
    }

    // ── Members ──────────────────────────────────────────────

    @GetMapping("/api/members")
    public ResponseEntity<ApiResponse<PageResponse<MemberResponse>>> getMembers(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok("Members fetched",
                gymOwnerService.getMembers(user.getId(), search, page, size)));
    }

    @GetMapping("/api/members/{id}")
    public ResponseEntity<ApiResponse<MemberResponse>> getMember(@AuthenticationPrincipal User user,
                                                                  @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Member fetched",
                gymOwnerService.getMember(user.getId(), id)));
    }

    @PostMapping("/api/members")
    public ResponseEntity<ApiResponse<MemberResponse>> addMember(@AuthenticationPrincipal User user,
                                                                   @Valid @RequestBody MemberRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Member added",
                gymOwnerService.addMember(user.getId(), request)));
    }

    @PutMapping("/api/members/{id}")
    public ResponseEntity<ApiResponse<MemberResponse>> updateMember(@AuthenticationPrincipal User user,
                                                                      @PathVariable Long id,
                                                                      @Valid @RequestBody MemberRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Member updated",
                gymOwnerService.updateMember(user.getId(), id, request)));
    }

    @DeleteMapping("/api/members/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMember(@AuthenticationPrincipal User user,
                                                           @PathVariable Long id) {
        gymOwnerService.deleteMember(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Member deleted"));
    }
}
