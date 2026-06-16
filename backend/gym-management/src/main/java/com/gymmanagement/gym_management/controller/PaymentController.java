package com.gymmanagement.gym_management.controller;

import com.gymmanagement.gym_management.dto.ApiResponse;
import com.gymmanagement.gym_management.dto.PageResponse;
import com.gymmanagement.gym_management.dto.payment.PaymentDashboardResponse;
import com.gymmanagement.gym_management.dto.payment.PaymentRequest;
import com.gymmanagement.gym_management.dto.payment.PaymentResponse;
import com.gymmanagement.gym_management.entity.User;
import com.gymmanagement.gym_management.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // ── Admin ─────────────────────────────────────────────────

    @GetMapping("/api/admin/payments")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> adminGetAll() {
        return ResponseEntity.ok(ApiResponse.ok("Payments fetched", paymentService.getAllPayments()));
    }

    // ── Gym Owner ─────────────────────────────────────────────

    @GetMapping("/api/owner/payments")
    @PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
    public ResponseEntity<ApiResponse<PageResponse<PaymentResponse>>> getPayments(
            @AuthenticationPrincipal User user,
            @RequestParam Long gymId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok("Payments fetched",
                paymentService.getPaymentsForGym(gymId, user.getId(), page, size)));
    }

    @GetMapping("/api/owner/payments/pending")
    @PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPendingPayments(
            @AuthenticationPrincipal User user,
            @RequestParam Long gymId) {
        return ResponseEntity.ok(ApiResponse.ok("Pending payments fetched",
                paymentService.getPendingPayments(gymId, user.getId())));
    }

    @GetMapping("/api/owner/payments/dashboard")
    @PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
    public ResponseEntity<ApiResponse<PaymentDashboardResponse>> getDashboard(
            @AuthenticationPrincipal User user,
            @RequestParam Long gymId) {
        return ResponseEntity.ok(ApiResponse.ok("Payment dashboard fetched",
                paymentService.getPaymentDashboard(gymId, user.getId())));
    }

    @GetMapping("/api/owner/payments/{id}")
    @PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPayment(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Payment fetched",
                paymentService.getPaymentById(id, user.getId())));
    }

    @PostMapping("/api/owner/payments")
    @PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
    public ResponseEntity<ApiResponse<PaymentResponse>> recordPayment(
            @AuthenticationPrincipal User user,
            @RequestParam Long gymId,
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Payment recorded",
                paymentService.recordPayment(gymId, user.getId(), request)));
    }

    @PutMapping("/api/owner/payments/{id}")
    @PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
    public ResponseEntity<ApiResponse<PaymentResponse>> updatePayment(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Payment updated",
                paymentService.updatePayment(id, user.getId(), request)));
    }

    @DeleteMapping("/api/owner/payments/{id}")
    @PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
    public ResponseEntity<ApiResponse<Void>> deletePayment(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        paymentService.deletePayment(id, user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Payment deleted"));
    }

    // ── Member ────────────────────────────────────────────────

    @GetMapping("/api/member/payments")
    @PreAuthorize("hasAuthority('ROLE_MEMBER')")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getMyPayments(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok("Payment history fetched",
                paymentService.getMemberPaymentHistory(user.getId())));
    }
}
