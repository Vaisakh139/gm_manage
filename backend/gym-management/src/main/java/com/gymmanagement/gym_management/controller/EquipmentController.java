package com.gymmanagement.gym_management.controller;

import com.gymmanagement.gym_management.dto.ApiResponse;
import com.gymmanagement.gym_management.dto.equipment.EquipmentRequest;
import com.gymmanagement.gym_management.dto.equipment.EquipmentResponse;
import com.gymmanagement.gym_management.entity.User;
import com.gymmanagement.gym_management.service.EquipmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService equipmentService;

    // ── ADMIN endpoints ───────────────────────────────────────

    @GetMapping("/api/admin/equipments")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<EquipmentResponse>>> adminGetAll() {
        return ResponseEntity.ok(ApiResponse.ok("Equipments fetched",
                equipmentService.getAllEquipments()));
    }

    @GetMapping("/api/admin/equipments/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<EquipmentResponse>> adminGetById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Equipment fetched",
                equipmentService.getEquipmentById(id)));
    }

    @PostMapping("/api/admin/equipments")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<EquipmentResponse>> adminCreate(
            @Valid @RequestBody EquipmentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Equipment created",
                equipmentService.adminCreateEquipment(request)));
    }

    @PutMapping("/api/admin/equipments/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<EquipmentResponse>> adminUpdate(
            @PathVariable Long id,
            @Valid @RequestBody EquipmentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Equipment updated",
                equipmentService.adminUpdateEquipment(id, request)));
    }

    @DeleteMapping("/api/admin/equipments/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> adminDelete(@PathVariable Long id) {
        equipmentService.adminDeleteEquipment(id);
        return ResponseEntity.ok(ApiResponse.ok("Equipment deleted"));
    }

    // ── GYM OWNER endpoints ───────────────────────────────────

    /** gymId required as query param since owner can manage multiple branches */
    @GetMapping("/api/owner/equipments")
    @PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
    public ResponseEntity<ApiResponse<List<EquipmentResponse>>> ownerGetAll(
            @AuthenticationPrincipal User user,
            @RequestParam Long gymId) {
        return ResponseEntity.ok(ApiResponse.ok("Equipments fetched",
                equipmentService.getOwnerEquipments(gymId, user.getId())));
    }

    @GetMapping("/api/owner/equipments/{id}")
    @PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
    public ResponseEntity<ApiResponse<EquipmentResponse>> ownerGetById(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Equipment fetched",
                equipmentService.getOwnerEquipmentById(id, user.getId())));
    }

    @PostMapping("/api/owner/equipments")
    @PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
    public ResponseEntity<ApiResponse<EquipmentResponse>> ownerCreate(
            @AuthenticationPrincipal User user,
            @RequestParam Long gymId,
            @Valid @RequestBody EquipmentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Equipment created",
                equipmentService.ownerCreateEquipment(gymId, user.getId(), request)));
    }

    @PutMapping("/api/owner/equipments/{id}")
    @PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
    public ResponseEntity<ApiResponse<EquipmentResponse>> ownerUpdate(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody EquipmentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Equipment updated",
                equipmentService.ownerUpdateEquipment(id, user.getId(), request)));
    }

    @DeleteMapping("/api/owner/equipments/{id}")
    @PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
    public ResponseEntity<ApiResponse<Void>> ownerDelete(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        equipmentService.ownerDeleteEquipment(id, user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Equipment deleted"));
    }

    // ── MEMBER endpoints ──────────────────────────────────────

    @GetMapping("/api/member/equipments")
    @PreAuthorize("hasAuthority('ROLE_MEMBER')")
    public ResponseEntity<ApiResponse<List<EquipmentResponse>>> memberGetAll(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok("Equipments fetched",
                equipmentService.getMemberEquipments(user.getId())));
    }
}
