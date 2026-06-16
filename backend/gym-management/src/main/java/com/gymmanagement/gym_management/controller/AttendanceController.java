package com.gymmanagement.gym_management.controller;

import com.gymmanagement.gym_management.dto.ApiResponse;
import com.gymmanagement.gym_management.dto.attendance.AttendanceDashboardResponse;
import com.gymmanagement.gym_management.dto.attendance.AttendanceRequest;
import com.gymmanagement.gym_management.dto.attendance.AttendanceResponse;
import com.gymmanagement.gym_management.entity.User;
import com.gymmanagement.gym_management.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    // ── Gym Owner ─────────────────────────────────────────────

    /** List attendance for a specific date (?date=2026-06-15, defaults to today) */
    @GetMapping("/api/owner/attendance")
    @PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getByDate(
            @AuthenticationPrincipal User user,
            @RequestParam Long gymId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.ok("Attendance fetched",
                attendanceService.getAttendanceByDate(gymId, user.getId(), date)));
    }

    /** Attendance history with date range (?from=2026-06-01&to=2026-06-30) */
    @GetMapping("/api/owner/attendance/history")
    @PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getHistory(
            @AuthenticationPrincipal User user,
            @RequestParam Long gymId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.ok("History fetched",
                attendanceService.getAttendanceHistory(gymId, user.getId(), from, to)));
    }

    @GetMapping("/api/owner/attendance/dashboard")
    @PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
    public ResponseEntity<ApiResponse<AttendanceDashboardResponse>> getDashboard(
            @AuthenticationPrincipal User user,
            @RequestParam Long gymId) {
        return ResponseEntity.ok(ApiResponse.ok("Dashboard fetched",
                attendanceService.getDashboard(gymId, user.getId())));
    }

    /** Mark check-in for a member */
    @PostMapping("/api/owner/attendance/check-in")
    @PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
    public ResponseEntity<ApiResponse<AttendanceResponse>> checkIn(
            @AuthenticationPrincipal User user,
            @RequestParam Long gymId,
            @Valid @RequestBody AttendanceRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Checked in",
                attendanceService.checkIn(gymId, user.getId(), request)));
    }

    /** Mark check-out for an open attendance record */
    @PutMapping("/api/owner/attendance/{id}/check-out")
    @PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
    public ResponseEntity<ApiResponse<AttendanceResponse>> checkOut(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Checked out",
                attendanceService.checkOut(id, user.getId())));
    }

    @DeleteMapping("/api/owner/attendance/{id}")
    @PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        attendanceService.deleteAttendance(id, user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Attendance deleted"));
    }

    // ── Member ────────────────────────────────────────────────

    /** Member's own attendance history */
    @GetMapping("/api/member/attendance")
    @PreAuthorize("hasAuthority('ROLE_MEMBER')")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getMyHistory(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok("History fetched",
                attendanceService.getMemberHistory(user.getId())));
    }

    /**
     * Auto check-in / check-out toggle:
     * - If no open record today → check in
     * - If open record today → check out
     */
    @PostMapping("/api/member/attendance/check-in")
    @PreAuthorize("hasAuthority('ROLE_MEMBER')")
    public ResponseEntity<ApiResponse<AttendanceResponse>> selfCheckIn(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok("Attendance recorded",
                attendanceService.selfCheckIn(user.getId())));
    }
}
