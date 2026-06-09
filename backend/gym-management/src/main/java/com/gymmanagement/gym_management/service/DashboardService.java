package com.gymmanagement.gym_management.service;

import com.gymmanagement.gym_management.dto.DashboardStats;
import com.gymmanagement.gym_management.model.PaymentStatus;
import com.gymmanagement.gym_management.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final MemberRepository memberRepository;
    private final TrainerRepository trainerRepository;
    private final PaymentRepository paymentRepository;
    private final WorkoutPlanRepository workoutPlanRepository;

    @Transactional(readOnly = true)
    public DashboardStats getStats() {
        return DashboardStats.builder()
                .totalMembers(memberRepository.count())
                .activeMembers(memberRepository.countByActiveTrue())
                .totalTrainers(trainerRepository.count())
                .activeTrainers(trainerRepository.countByActiveTrue())
                .totalPayments(paymentRepository.count())
                .pendingPayments(paymentRepository.countByStatus(PaymentStatus.PENDING))
                .totalRevenue(paymentRepository.sumPaidAmount())
                .activeWorkoutPlans(workoutPlanRepository.findAll().stream().filter(w -> w.isActive()).count())
                .build();
    }
}
