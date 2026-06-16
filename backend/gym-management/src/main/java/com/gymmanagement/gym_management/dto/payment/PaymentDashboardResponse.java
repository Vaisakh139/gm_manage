package com.gymmanagement.gym_management.dto.payment;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class PaymentDashboardResponse {

    private BigDecimal todayRevenue;
    private BigDecimal monthlyRevenue;
    private BigDecimal totalRevenue;
    private long pendingPaymentsCount;
    private BigDecimal pendingAmount;

    /** Last 12 months revenue breakdown */
    private List<MonthlySummary> monthlySummary;

    @Data
    @Builder
    public static class MonthlySummary {
        private int year;
        private int month;
        private String monthLabel;   // e.g. "Jun 2026"
        private BigDecimal total;
        private long count;
    }
}
