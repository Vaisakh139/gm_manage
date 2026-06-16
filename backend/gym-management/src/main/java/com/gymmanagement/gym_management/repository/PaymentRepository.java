package com.gymmanagement.gym_management.repository;

import com.gymmanagement.gym_management.entity.Payment;
import com.gymmanagement.gym_management.entity.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // ── Gym-scoped queries ────────────────────────────────────

    Page<Payment> findByMember_Gym_IdOrderByPaymentDateDesc(Long gymId, Pageable pageable);

    List<Payment> findByMember_Gym_IdAndStatusOrderByPaymentDateDesc(Long gymId, PaymentStatus status);

    Optional<Payment> findByIdAndMember_Gym_Id(Long id, Long gymId);

    // ── Member queries ────────────────────────────────────────

    List<Payment> findByMemberIdOrderByPaymentDateDesc(Long memberId);

    // ── Revenue aggregations ──────────────────────────────────

    @Query("""
        SELECT COALESCE(SUM(p.amount), 0)
        FROM Payment p
        WHERE p.member.gym.id = :gymId
          AND p.status = 'PAID'
          AND p.paymentDate = :date
        """)
    BigDecimal sumPaidByGymAndDate(@Param("gymId") Long gymId, @Param("date") LocalDate date);

    @Query("""
        SELECT COALESCE(SUM(p.amount), 0)
        FROM Payment p
        WHERE p.member.gym.id = :gymId
          AND p.status = 'PAID'
          AND EXTRACT(YEAR  FROM p.paymentDate) = :year
          AND EXTRACT(MONTH FROM p.paymentDate) = :month
        """)
    BigDecimal sumPaidByGymAndMonth(@Param("gymId") Long gymId,
                                    @Param("year") int year,
                                    @Param("month") int month);

    @Query("""
        SELECT COALESCE(SUM(p.amount), 0)
        FROM Payment p
        WHERE p.member.gym.id = :gymId
          AND p.status = 'PAID'
        """)
    BigDecimal sumTotalPaidByGym(@Param("gymId") Long gymId);

    @Query("""
        SELECT COALESCE(SUM(p.amount), 0)
        FROM Payment p
        WHERE p.member.gym.id = :gymId
          AND p.status = :status
        """)
    BigDecimal sumByGymAndStatus(@Param("gymId") Long gymId, @Param("status") PaymentStatus status);

    long countByMember_Gym_IdAndStatus(Long gymId, PaymentStatus status);

    // ── Monthly summary ───────────────────────────────────────

    // CAST removed — EXTRACT returns numeric types; PaymentService.buildMonthlySummary()
    // handles conversion via ((Number) row[x]).intValue()
    @Query("""
        SELECT EXTRACT(YEAR  FROM p.paymentDate),
               EXTRACT(MONTH FROM p.paymentDate),
               SUM(p.amount),
               COUNT(p)
        FROM Payment p
        WHERE p.member.gym.id = :gymId
          AND p.status = 'PAID'
        GROUP BY EXTRACT(YEAR  FROM p.paymentDate),
                 EXTRACT(MONTH FROM p.paymentDate)
        ORDER BY EXTRACT(YEAR  FROM p.paymentDate) DESC,
                 EXTRACT(MONTH FROM p.paymentDate) DESC
        """)
    List<Object[]> findMonthlyRevenueSummary(@Param("gymId") Long gymId);
}
