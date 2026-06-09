package com.gymmanagement.gym_management.dto;

import com.gymmanagement.gym_management.model.PaymentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PaymentRequest {
    @NotNull
    private Long memberId;
    private Long planId;
    @NotNull
    private BigDecimal amount;
    private LocalDate paymentDate;
    private LocalDate dueDate;
    private PaymentStatus status;
    private String paymentMethod;
    private String notes;
}
