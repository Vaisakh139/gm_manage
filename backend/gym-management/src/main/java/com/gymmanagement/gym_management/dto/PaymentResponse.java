package com.gymmanagement.gym_management.dto;

import com.gymmanagement.gym_management.model.PaymentStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class PaymentResponse {
    private Long id;
    private Long memberId;
    private String memberName;
    private Long planId;
    private String planName;
    private BigDecimal amount;
    private LocalDate paymentDate;
    private LocalDate dueDate;
    private PaymentStatus status;
    private String paymentMethod;
    private String notes;
    private LocalDateTime createdAt;
}
