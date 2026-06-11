package com.gymmanagement.gym_management.controller;

import com.gymmanagement.gym_management.dto.ApiResponse;
import com.gymmanagement.gym_management.dto.admin.*;
import com.gymmanagement.gym_management.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * All routes require ROLE_ADMIN.
 * Using hasAuthority('ROLE_ADMIN') for explicit, prefix-safe matching.
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // ── Dashboard ────────────────────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok("Stats fetched", adminService.getDashboardStats()));
    }

    // ── Gyms ────────────────────────────────────────────────

    @GetMapping("/gyms")
    public ResponseEntity<ApiResponse<List<GymResponse>>> getAllGyms() {
        return ResponseEntity.ok(ApiResponse.ok("Gyms fetched", adminService.getAllGyms()));
    }

    @PostMapping("/gyms")
    public ResponseEntity<ApiResponse<GymResponse>> createGym(@Valid @RequestBody GymRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Gym created successfully", adminService.createGym(request)));
    }

    @PutMapping("/gyms/{id}")
    public ResponseEntity<ApiResponse<GymResponse>> updateGym(@PathVariable Long id,
                                                               @Valid @RequestBody GymRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Gym updated", adminService.updateGym(id, request)));
    }

    @DeleteMapping("/gyms/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGym(@PathVariable Long id) {
        adminService.deleteGym(id);
        return ResponseEntity.ok(ApiResponse.ok("Gym deleted"));
    }

    // ── Users ────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok("Users fetched", adminService.getAllUsers()));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        boolean active = body.getOrDefault("active", true);
        return ResponseEntity.ok(ApiResponse.ok("User status updated",
                adminService.updateUserStatus(id, active)));
    }
}
