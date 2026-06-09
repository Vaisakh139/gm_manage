package com.gymmanagement.gym_management.controller;

import com.gymmanagement.gym_management.dto.TrainerRequest;
import com.gymmanagement.gym_management.dto.TrainerResponse;
import com.gymmanagement.gym_management.model.User;
import com.gymmanagement.gym_management.service.TrainerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trainers")
@RequiredArgsConstructor
public class TrainerController {

    private final TrainerService trainerService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER')")
    public ResponseEntity<List<TrainerResponse>> getAll() {
        return ResponseEntity.ok(trainerService.getAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TrainerResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(trainerService.getById(id));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('TRAINER')")
    public ResponseEntity<TrainerResponse> getMyProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(trainerService.getByUserId(user.getId()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TrainerResponse> create(@Valid @RequestBody TrainerRequest request) {
        return ResponseEntity.ok(trainerService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TrainerResponse> update(@PathVariable Long id, @Valid @RequestBody TrainerRequest request) {
        return ResponseEntity.ok(trainerService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        trainerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
