package com.gymmanagement.gym_management.dto.payment;

import com.gymmanagement.gym_management.entity.PaymentMethod;
import com.gymmanagement.gym_management.entity.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentResponse {
    private Long id;
    private Long memberId;
    private String memberName;
    private String memberEmail;
    private Long membershipPlanId;
    private String membershipPlanName;
    private BigDecimal amount;
    private LocalDate paymentDate;
    private PaymentMethod paymentMethod;
    private PaymentStatus status;
    private String notes;
    private LocalDateTime createdAt;
}
