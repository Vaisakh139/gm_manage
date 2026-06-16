package com.gymmanagement.gym_management.mapper;

import com.gymmanagement.gym_management.dto.plan.MembershipPlanRequest;
import com.gymmanagement.gym_management.dto.plan.MembershipPlanResponse;
import com.gymmanagement.gym_management.entity.MembershipPlan;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface MembershipPlanMapper {

    @Mapping(source = "gym.id",      target = "gymId")
    @Mapping(source = "gym.gymName", target = "gymName")
    MembershipPlanResponse toResponse(MembershipPlan plan);

    @Mapping(target = "id",        ignore = true)
    @Mapping(target = "gym",       ignore = true)
    @Mapping(target = "active",    ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    MembershipPlan toEntity(MembershipPlanRequest request);

    @Mapping(target = "id",        ignore = true)
    @Mapping(target = "gym",       ignore = true)
    @Mapping(target = "active",    ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void update(MembershipPlanRequest request, @MappingTarget MembershipPlan plan);
}
