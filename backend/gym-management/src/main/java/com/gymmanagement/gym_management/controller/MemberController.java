package com.gymmanagement.gym_management.controller;

import com.gymmanagement.gym_management.dto.ApiResponse;
import com.gymmanagement.gym_management.dto.member.ProfileResponse;
import com.gymmanagement.gym_management.dto.member.UpdateProfileRequest;
import com.gymmanagement.gym_management.entity.User;
import com.gymmanagement.gym_management.service.MemberProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@PreAuthorize("hasRole('MEMBER')")
@RequiredArgsConstructor
public class MemberController {

    private final MemberProfileService memberProfileService;

    @GetMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok("Profile fetched", memberProfileService.getProfile(user.getId())));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(@AuthenticationPrincipal User user,
                                                                       @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Profile updated", memberProfileService.updateProfile(user.getId(), request)));
    }
}
