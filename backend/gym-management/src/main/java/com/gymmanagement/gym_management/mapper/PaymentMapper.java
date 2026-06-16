package com.gymmanagement.gym_management.mapper;

import com.gymmanagement.gym_management.dto.payment.PaymentResponse;
import com.gymmanagement.gym_management.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PaymentMapper {

    @Mapping(source = "member.id",               target = "memberId")
    @Mapping(source = "member.user.name",         target = "memberName")
    @Mapping(source = "member.user.email",        target = "memberEmail")
    @Mapping(source = "membershipPlan.id",         target = "membershipPlanId")
    @Mapping(source = "membershipPlan.name",       target = "membershipPlanName")
    PaymentResponse toResponse(Payment payment);
}
