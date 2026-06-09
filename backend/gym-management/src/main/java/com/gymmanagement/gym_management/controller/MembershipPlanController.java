package com.gymmanagement.gym_management.controller;

import com.gymmanagement.gym_management.dto.PlanRequest;
import com.gymmanagement.gym_management.dto.PlanResponse;
import com.gymmanagement.gym_management.service.MembershipPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plans")
@RequiredArgsConstructor
public class MembershipPlanController {

    private final MembershipPlanService planService;

    @GetMapping
    public ResponseEntity<List<PlanResponse>> getAll() {
        return ResponseEntity.ok(planService.getAll());
    }

    @GetMapping("/active")
    public ResponseEntity<List<PlanResponse>> getActive() {
        return ResponseEntity.ok(planService.getActive());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlanResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(planService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PlanResponse> create(@Valid @RequestBody PlanRequest request) {
        return ResponseEntity.ok(planService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PlanResponse> update(@PathVariable Long id, @Valid @RequestBody PlanRequest request) {
        return ResponseEntity.ok(planService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        planService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
