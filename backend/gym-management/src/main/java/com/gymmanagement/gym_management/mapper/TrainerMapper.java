package com.gymmanagement.gym_management.mapper;

import com.gymmanagement.gym_management.dto.trainer.TrainerRequest;
import com.gymmanagement.gym_management.dto.trainer.TrainerResponse;
import com.gymmanagement.gym_management.entity.Trainer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface TrainerMapper {

    @Mapping(source = "gym.id",      target = "gymId")
    @Mapping(source = "gym.gymName", target = "gymName")
    @Mapping(target = "assignedMembersCount", ignore = true)   // set by service
    TrainerResponse toResponse(Trainer trainer);

    @Mapping(target = "id",        ignore = true)
    @Mapping(target = "gym",       ignore = true)
    @Mapping(target = "active",    ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Trainer toEntity(TrainerRequest request);

    @Mapping(target = "id",        ignore = true)
    @Mapping(target = "gym",       ignore = true)
    @Mapping(target = "active",    ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void update(TrainerRequest request, @MappingTarget Trainer trainer);
}
