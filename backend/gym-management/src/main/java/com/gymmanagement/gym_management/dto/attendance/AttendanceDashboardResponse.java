package com.gymmanagement.gym_management.dto.attendance;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class AttendanceDashboardResponse {

    /** How many check-ins happened today */
    private long todayCount;

    /** How many check-ins happened this calendar month */
    private long monthlyCount;

    /** Members currently inside (checked in, not yet checked out) */
    private long currentlyActiveCount;

    /** Per-day breakdown for the current month */
    private List<DailyCount> dailyCounts;

    @Data
    @Builder
    public static class DailyCount {
        private LocalDate date;
        private long count;
    }
}
