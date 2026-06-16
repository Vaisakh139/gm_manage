package com.gymmanagement.gym_management.dto.payment;

import com.gymmanagement.gym_management.entity.PaymentMethod;
import com.gymmanagement.gym_management.entity.PaymentStatus;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PaymentRequest {

    @NotNull(message = "Member ID is required")
    private Long memberId;

    /** Optional — link to a specific membership plan */
    private Long membershipPlanId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.0", message = "Amount must be >= 0")
    private BigDecimal amount;

    @NotNull(message = "Payment date is required")
    private LocalDate paymentDate;

    private PaymentMethod paymentMethod;

    private PaymentStatus status;

    @Size(max = 500)
    private String notes;
}
