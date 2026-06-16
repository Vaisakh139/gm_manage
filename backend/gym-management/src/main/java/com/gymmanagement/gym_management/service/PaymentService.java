package com.gymmanagement.gym_management.service;

import com.gymmanagement.gym_management.dto.payment.PaymentDashboardResponse;
import com.gymmanagement.gym_management.dto.payment.PaymentRequest;
import com.gymmanagement.gym_management.dto.payment.PaymentResponse;
import com.gymmanagement.gym_management.entity.*;
import com.gymmanagement.gym_management.exception.BusinessException;
import com.gymmanagement.gym_management.exception.ResourceNotFoundException;
import com.gymmanagement.gym_management.mapper.PaymentMapper;
import com.gymmanagement.gym_management.repository.GymRepository;
import com.gymmanagement.gym_management.repository.MemberRepository;
import com.gymmanagement.gym_management.repository.MembershipPlanRepository;
import com.gymmanagement.gym_management.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import com.gymmanagement.gym_management.dto.PageResponse;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final MemberRepository memberRepository;
    private final MembershipPlanRepository planRepository;
    private final GymRepository gymRepository;
    private final PaymentMapper paymentMapper;

    // ── Gym Owner ─────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PageResponse<PaymentResponse> getPaymentsForGym(Long gymId, Long ownerId, int page, int size) {
        validateOwnership(gymId, ownerId);
        Pageable pageable = PageRequest.of(page, size);
        Page<PaymentResponse> result = paymentRepository
                .findByMember_Gym_IdOrderByPaymentDateDesc(gymId, pageable)
                .map(paymentMapper::toResponse);
        return PageResponse.from(result);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPendingPayments(Long gymId, Long ownerId) {
        validateOwnership(gymId, ownerId);
        return paymentRepository
                .findByMember_Gym_IdAndStatusOrderByPaymentDateDesc(gymId, PaymentStatus.PENDING)
                .stream().map(paymentMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long paymentId, Long ownerId) {
        Payment payment = findPaymentInOwnerGym(paymentId, ownerId);
        return paymentMapper.toResponse(payment);
    }

    @Transactional
    public PaymentResponse recordPayment(Long gymId, Long ownerId, PaymentRequest request) {
        validateOwnership(gymId, ownerId);

        Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));
        if (!member.getGym().getId().equals(gymId)) {
            throw new BusinessException("Member does not belong to this gym");
        }

        MembershipPlan plan = null;
        if (request.getMembershipPlanId() != null) {
            plan = planRepository.findById(request.getMembershipPlanId()).orElse(null);
        }

        Payment payment = Payment.builder()
                .member(member)
                .membershipPlan(plan)
                .amount(request.getAmount())
                .paymentDate(request.getPaymentDate() != null ? request.getPaymentDate() : LocalDate.now())
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : PaymentMethod.CASH)
                .status(request.getStatus() != null ? request.getStatus() : PaymentStatus.PAID)
                .notes(request.getNotes())
                .build();

        payment = paymentRepository.save(payment);

        log.info("[PAYMENT] Recorded | paymentId={} memberId={} amount={} status={}",
                payment.getId(), member.getId(), payment.getAmount(), payment.getStatus());

        return paymentMapper.toResponse(payment);
    }

    @Transactional
    public PaymentResponse updatePayment(Long paymentId, Long ownerId, PaymentRequest request) {
        Payment payment = findPaymentInOwnerGym(paymentId, ownerId);

        if (request.getMembershipPlanId() != null) {
            payment.setMembershipPlan(
                    planRepository.findById(request.getMembershipPlanId()).orElse(null));
        }
        payment.setAmount(request.getAmount());
        if (request.getPaymentDate() != null) payment.setPaymentDate(request.getPaymentDate());
        if (request.getPaymentMethod() != null) payment.setPaymentMethod(request.getPaymentMethod());
        if (request.getStatus() != null) payment.setStatus(request.getStatus());
        payment.setNotes(request.getNotes());

        payment = paymentRepository.save(payment);

        log.info("[PAYMENT] Updated | paymentId={} status={}", paymentId, payment.getStatus());
        return paymentMapper.toResponse(payment);
    }

    @Transactional
    public void deletePayment(Long paymentId, Long ownerId) {
        Payment payment = findPaymentInOwnerGym(paymentId, ownerId);
        log.info("[PAYMENT] Deleted | paymentId={}", paymentId);
        paymentRepository.delete(payment);
    }

    // ── Revenue Dashboard ─────────────────────────────────────

    @Transactional(readOnly = true)
    public PaymentDashboardResponse getPaymentDashboard(Long gymId, Long ownerId) {
        validateOwnership(gymId, ownerId);

        LocalDate today = LocalDate.now();
        BigDecimal todayRevenue   = paymentRepository.sumPaidByGymAndDate(gymId, today);
        BigDecimal monthlyRevenue = paymentRepository.sumPaidByGymAndMonth(gymId, today.getYear(), today.getMonthValue());
        BigDecimal totalRevenue   = paymentRepository.sumTotalPaidByGym(gymId);
        BigDecimal pendingAmount  = paymentRepository.sumByGymAndStatus(gymId, PaymentStatus.PENDING);
        long pendingCount         = paymentRepository.countByMember_Gym_IdAndStatus(gymId, PaymentStatus.PENDING);

        // Monthly summary — last 12 months
        List<Object[]> rawSummary = paymentRepository.findMonthlyRevenueSummary(gymId);
        List<PaymentDashboardResponse.MonthlySummary> monthlySummary = buildMonthlySummary(rawSummary);

        log.debug("[PAYMENT] Dashboard | gymId={} todayRevenue={} monthlyRevenue={}",
                gymId, todayRevenue, monthlyRevenue);

        return PaymentDashboardResponse.builder()
                .todayRevenue(todayRevenue)
                .monthlyRevenue(monthlyRevenue)
                .totalRevenue(totalRevenue)
                .pendingPaymentsCount(pendingCount)
                .pendingAmount(pendingAmount)
                .monthlySummary(monthlySummary)
                .build();
    }

    // ── Member ────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<PaymentResponse> getMemberPaymentHistory(Long userId) {
        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member profile not found"));
        return paymentRepository.findByMemberIdOrderByPaymentDateDesc(member.getId())
                .stream().map(paymentMapper::toResponse).toList();
    }

    // ── Admin ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream().map(paymentMapper::toResponse).toList();
    }

    // ── Helpers ───────────────────────────────────────────────

    private void validateOwnership(Long gymId, Long ownerId) {
        gymRepository.findByIdAndOwnerId(gymId, ownerId)
                .orElseThrow(() -> new BusinessException("Gym not found or does not belong to you"));
    }

    private Payment findPaymentInOwnerGym(Long paymentId, Long ownerId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + paymentId));
        Long gymId = payment.getMember().getGym().getId();
        gymRepository.findByIdAndOwnerId(gymId, ownerId)
                .orElseThrow(() -> new BusinessException("Payment does not belong to one of your gyms"));
        return payment;
    }

    private List<PaymentDashboardResponse.MonthlySummary> buildMonthlySummary(List<Object[]> raw) {
        List<PaymentDashboardResponse.MonthlySummary> result = new ArrayList<>();
        for (Object[] row : raw) {
            int year  = ((Number) row[0]).intValue();
            int month = ((Number) row[1]).intValue();
            BigDecimal total = (BigDecimal) row[2];
            long count = ((Number) row[3]).longValue();

            String label = Month.of(month).getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + year;
            result.add(PaymentDashboardResponse.MonthlySummary.builder()
                    .year(year).month(month).monthLabel(label)
                    .total(total).count(count).build());
        }
        return result;
    }
}
