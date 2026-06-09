package com.gymmanagement.gym_management.service;

import com.gymmanagement.gym_management.dto.PaymentRequest;
import com.gymmanagement.gym_management.dto.PaymentResponse;
import com.gymmanagement.gym_management.model.*;
import com.gymmanagement.gym_management.repository.MemberRepository;
import com.gymmanagement.gym_management.repository.MembershipPlanRepository;
import com.gymmanagement.gym_management.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final MemberRepository memberRepository;
    private final MembershipPlanRepository planRepository;

    @Transactional(readOnly = true)
    public List<PaymentResponse> getAll() {
        return paymentRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getByMember(Long memberId) {
        return paymentRepository.findByMemberId(memberId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaymentResponse getById(Long id) {
        return toResponse(paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found")));
    }

    @Transactional
    public PaymentResponse create(PaymentRequest req) {
        Member member = memberRepository.findById(req.getMemberId())
                .orElseThrow(() -> new RuntimeException("Member not found"));

        MembershipPlan plan = req.getPlanId() != null
                ? planRepository.findById(req.getPlanId()).orElse(null)
                : null;

        Payment payment = Payment.builder()
                .member(member)
                .plan(plan)
                .amount(req.getAmount())
                .paymentDate(req.getPaymentDate())
                .dueDate(req.getDueDate())
                .status(req.getStatus() != null ? req.getStatus() : PaymentStatus.PENDING)
                .paymentMethod(req.getPaymentMethod())
                .notes(req.getNotes())
                .build();

        return toResponse(paymentRepository.save(payment));
    }

    @Transactional
    public PaymentResponse update(Long id, PaymentRequest req) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setAmount(req.getAmount());
        payment.setPaymentDate(req.getPaymentDate());
        payment.setDueDate(req.getDueDate());
        if (req.getStatus() != null) payment.setStatus(req.getStatus());
        payment.setPaymentMethod(req.getPaymentMethod());
        payment.setNotes(req.getNotes());

        return toResponse(paymentRepository.save(payment));
    }

    @Transactional
    public void delete(Long id) {
        paymentRepository.deleteById(id);
    }

    private PaymentResponse toResponse(Payment p) {
        PaymentResponse r = new PaymentResponse();
        r.setId(p.getId());
        r.setMemberId(p.getMember().getId());
        r.setMemberName(p.getMember().getFirstName() + " " + p.getMember().getLastName());
        r.setAmount(p.getAmount());
        r.setPaymentDate(p.getPaymentDate());
        r.setDueDate(p.getDueDate());
        r.setStatus(p.getStatus());
        r.setPaymentMethod(p.getPaymentMethod());
        r.setNotes(p.getNotes());
        r.setCreatedAt(p.getCreatedAt());
        if (p.getPlan() != null) {
            r.setPlanId(p.getPlan().getId());
            r.setPlanName(p.getPlan().getName());
        }
        return r;
    }
}
