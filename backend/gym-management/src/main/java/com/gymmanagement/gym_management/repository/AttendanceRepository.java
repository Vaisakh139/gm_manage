package com.gymmanagement.gym_management.repository;

import com.gymmanagement.gym_management.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    // ── Gym-level queries ─────────────────────────────────────

    List<Attendance> findByMember_Gym_IdAndAttendanceDateOrderByCheckInTimeDesc(Long gymId, LocalDate date);

    List<Attendance> findByMember_Gym_IdAndAttendanceDateBetweenOrderByAttendanceDateDescCheckInTimeDesc(
            Long gymId, LocalDate from, LocalDate to);

    long countByMember_Gym_IdAndAttendanceDate(Long gymId, LocalDate date);

    long countByMember_Gym_IdAndAttendanceDateBetween(Long gymId, LocalDate from, LocalDate to);

    /** Members currently inside (checked in today, no checkout yet) */
    long countByMember_Gym_IdAndAttendanceDateAndCheckOutTimeIsNull(Long gymId, LocalDate date);

    /** Per-day attendance count for a date range */
    @Query("""
        SELECT a.attendanceDate, COUNT(a)
        FROM Attendance a
        WHERE a.member.gym.id = :gymId
          AND a.attendanceDate BETWEEN :from AND :to
        GROUP BY a.attendanceDate
        ORDER BY a.attendanceDate DESC
        """)
    List<Object[]> countByDateRange(@Param("gymId") Long gymId,
                                    @Param("from")  LocalDate from,
                                    @Param("to")    LocalDate to);

    // ── Member queries ────────────────────────────────────────

    List<Attendance> findByMemberIdOrderByAttendanceDateDescCheckInTimeDesc(Long memberId);

    /** Check if a member already has an open check-in today */
    Optional<Attendance> findByMemberIdAndAttendanceDateAndCheckOutTimeIsNull(
            Long memberId, LocalDate date);

    /** Check if a member already has any attendance record for a date */
    boolean existsByMemberIdAndAttendanceDate(Long memberId, LocalDate date);

    long countByMemberId(Long memberId);
}
