package com.gymmanagement.gym_management.service;

import com.gymmanagement.gym_management.dto.attendance.AttendanceDashboardResponse;
import com.gymmanagement.gym_management.dto.attendance.AttendanceRequest;
import com.gymmanagement.gym_management.dto.attendance.AttendanceResponse;
import com.gymmanagement.gym_management.entity.*;
import com.gymmanagement.gym_management.exception.BusinessException;
import com.gymmanagement.gym_management.exception.ResourceNotFoundException;
import com.gymmanagement.gym_management.mapper.AttendanceMapper;
import com.gymmanagement.gym_management.repository.AttendanceRepository;
import com.gymmanagement.gym_management.repository.GymRepository;
import com.gymmanagement.gym_management.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final MemberRepository memberRepository;
    private final GymRepository gymRepository;
    private final AttendanceMapper attendanceMapper;

    // ── Gym Owner ─────────────────────────────────────────────

    /** List attendance for a specific date (defaults to today) */
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAttendanceByDate(Long gymId, Long ownerId, LocalDate date) {
        validateOwnership(gymId, ownerId);
        LocalDate target = date != null ? date : LocalDate.now();
        return attendanceRepository
                .findByMember_Gym_IdAndAttendanceDateOrderByCheckInTimeDesc(gymId, target)
                .stream().map(attendanceMapper::toResponse).toList();
    }

    /** Today's checked-in list + recent history for the last 30 days */
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAttendanceHistory(Long gymId, Long ownerId,
                                                          LocalDate from, LocalDate to) {
        validateOwnership(gymId, ownerId);
        LocalDate end   = to   != null ? to   : LocalDate.now();
        LocalDate start = from != null ? from : end.minusDays(29);
        return attendanceRepository
                .findByMember_Gym_IdAndAttendanceDateBetweenOrderByAttendanceDateDescCheckInTimeDesc(
                        gymId, start, end)
                .stream().map(attendanceMapper::toResponse).toList();
    }

    /** Mark a member's check-in */
    @Transactional
    public AttendanceResponse checkIn(Long gymId, Long ownerId, AttendanceRequest request) {
        validateOwnership(gymId, ownerId);

        Member member = findMemberInGym(request.getMemberId(), gymId);
        LocalDate date = request.getAttendanceDate() != null ? request.getAttendanceDate() : LocalDate.now();
        LocalTime time = request.getCheckInTime()   != null ? request.getCheckInTime()    : LocalTime.now().withSecond(0).withNano(0);

        // Prevent duplicate open check-in on the same day
        if (attendanceRepository.findByMemberIdAndAttendanceDateAndCheckOutTimeIsNull(
                member.getId(), date).isPresent()) {
            throw new BusinessException("Member is already checked in today");
        }

        Attendance a = Attendance.builder()
                .member(member)
                .attendanceDate(date)
                .checkInTime(time)
                .build();
        a = attendanceRepository.save(a);

        log.info("[ATTENDANCE] Check-in | attendanceId={} memberId={} gymId={} date={} time={}",
                a.getId(), member.getId(), gymId, date, time);

        return attendanceMapper.toResponse(a);
    }

    /** Mark check-out for an open attendance record */
    @Transactional
    public AttendanceResponse checkOut(Long attendanceId, Long ownerId) {
        Attendance a = findAttendance(attendanceId);
        validateOwnership(a.getMember().getGym().getId(), ownerId);

        if (a.getCheckOutTime() != null) {
            throw new BusinessException("Member has already checked out");
        }

        a.setCheckOutTime(LocalTime.now().withSecond(0).withNano(0));
        a = attendanceRepository.save(a);

        log.info("[ATTENDANCE] Check-out | attendanceId={} memberId={} checkOut={}",
                attendanceId, a.getMember().getId(), a.getCheckOutTime());

        return attendanceMapper.toResponse(a);
    }

    @Transactional
    public void deleteAttendance(Long attendanceId, Long ownerId) {
        Attendance a = findAttendance(attendanceId);
        validateOwnership(a.getMember().getGym().getId(), ownerId);
        log.info("[ATTENDANCE] Deleted | attendanceId={}", attendanceId);
        attendanceRepository.delete(a);
    }

    // ── Attendance Dashboard ──────────────────────────────────

    @Transactional(readOnly = true)
    public AttendanceDashboardResponse getDashboard(Long gymId, Long ownerId) {
        validateOwnership(gymId, ownerId);

        LocalDate today      = LocalDate.now();
        LocalDate monthStart = today.withDayOfMonth(1);

        long todayCount   = attendanceRepository.countByMember_Gym_IdAndAttendanceDate(gymId, today);
        long monthlyCount = attendanceRepository.countByMember_Gym_IdAndAttendanceDateBetween(
                gymId, monthStart, today);
        long activeCount  = attendanceRepository
                .countByMember_Gym_IdAndAttendanceDateAndCheckOutTimeIsNull(gymId, today);

        // Per-day counts for the current month
        List<Object[]> raw = attendanceRepository.countByDateRange(gymId, monthStart, today);
        List<AttendanceDashboardResponse.DailyCount> daily = raw.stream()
                .map(row -> AttendanceDashboardResponse.DailyCount.builder()
                        .date((LocalDate) row[0])
                        .count(((Number) row[1]).longValue())
                        .build())
                .toList();

        log.debug("[ATTENDANCE] Dashboard | gymId={} today={} monthly={} active={}",
                gymId, todayCount, monthlyCount, activeCount);

        return AttendanceDashboardResponse.builder()
                .todayCount(todayCount)
                .monthlyCount(monthlyCount)
                .currentlyActiveCount(activeCount)
                .dailyCounts(daily)
                .build();
    }

    // ── Member self-service ───────────────────────────────────

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getMemberHistory(Long userId) {
        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member profile not found"));
        return attendanceRepository
                .findByMemberIdOrderByAttendanceDateDescCheckInTimeDesc(member.getId())
                .stream().map(attendanceMapper::toResponse).toList();
    }

    /**
     * Auto check-in/check-out for a member:
     * - No record today → create check-in
     * - Open record today → set check-out time
     */
    @Transactional
    public AttendanceResponse selfCheckIn(Long userId) {
        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member profile not found"));

        LocalDate today = LocalDate.now();
        LocalTime now   = LocalTime.now().withSecond(0).withNano(0);

        // Check for an open record today
        var openRecord = attendanceRepository
                .findByMemberIdAndAttendanceDateAndCheckOutTimeIsNull(member.getId(), today);

        if (openRecord.isPresent()) {
            // Check out
            Attendance a = openRecord.get();
            a.setCheckOutTime(now);
            a = attendanceRepository.save(a);
            log.info("[ATTENDANCE] Self check-out | memberId={} checkOut={}", member.getId(), now);
            return attendanceMapper.toResponse(a);
        }

        // Check in
        Attendance a = Attendance.builder()
                .member(member)
                .attendanceDate(today)
                .checkInTime(now)
                .build();
        a = attendanceRepository.save(a);
        log.info("[ATTENDANCE] Self check-in | memberId={} gymId={} checkIn={}",
                member.getId(), member.getGym().getId(), now);
        return attendanceMapper.toResponse(a);
    }

    // ── Admin ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAllToday() {
        return attendanceRepository
                .findByMember_Gym_IdAndAttendanceDateOrderByCheckInTimeDesc(null, LocalDate.now())
                .stream().map(attendanceMapper::toResponse).toList();
    }

    // ── Helpers ───────────────────────────────────────────────

    private void validateOwnership(Long gymId, Long ownerId) {
        gymRepository.findByIdAndOwnerId(gymId, ownerId)
                .orElseThrow(() -> new BusinessException("Gym not found or does not belong to you"));
    }

    private Member findMemberInGym(Long memberId, Long gymId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found: " + memberId));
        if (!member.getGym().getId().equals(gymId)) {
            throw new BusinessException("Member does not belong to this gym");
        }
        return member;
    }

    private Attendance findAttendance(Long id) {
        return attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found: " + id));
    }
}
