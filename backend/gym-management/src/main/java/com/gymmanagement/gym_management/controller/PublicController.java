package com.gymmanagement.gym_management.controller;

import com.gymmanagement.gym_management.dto.ApiResponse;
import com.gymmanagement.gym_management.dto.PageResponse;
import com.gymmanagement.gym_management.dto.pub.GymPublicResponse;
import com.gymmanagement.gym_management.service.PublicGymService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Unauthenticated endpoints used by the public landing page.
 * All routes are under /api/public/** and are permitted in SecurityConfig.
 */
@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final PublicGymService publicGymService;

    /**
     * Search gyms by name or city.
     * GET /api/public/gyms?query=&page=0&size=10
     */
    @GetMapping("/gyms")
    public ResponseEntity<ApiResponse<PageResponse<GymPublicResponse>>> searchGyms(
            @RequestParam(defaultValue = "") String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok("Gyms fetched",
                publicGymService.search(query, page, size)));
    }

    /**
     * Get single gym public details.
     * GET /api/public/gyms/{id}
     */
    @GetMapping("/gyms/{id}")
    public ResponseEntity<ApiResponse<GymPublicResponse>> getGym(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Gym fetched", publicGymService.getById(id)));
    }
}
