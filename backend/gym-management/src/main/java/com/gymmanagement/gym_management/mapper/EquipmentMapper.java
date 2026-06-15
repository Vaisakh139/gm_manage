package com.gymmanagement.gym_management.mapper;

import com.gymmanagement.gym_management.dto.equipment.EquipmentRequest;
import com.gymmanagement.gym_management.dto.equipment.EquipmentResponse;
import com.gymmanagement.gym_management.entity.Equipment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/**
 * MapStruct mapper for Equipment entity ↔ DTOs.
 *
 * Mappings that access gym.gymName MUST be called inside a @Transactional
 * method to prevent LazyInitializationException on the gym proxy.
 */
@Mapper(componentModel = "spring")
public interface EquipmentMapper {

    /**
     * Maps Equipment entity → EquipmentResponse DTO.
     * gym.id → gymId, gym.gymName → gymName (requires open Hibernate session).
     */
    @Mapping(source = "gym.id",      target = "gymId")
    @Mapping(source = "gym.gymName", target = "gymName")
    EquipmentResponse toEquipmentResponse(Equipment equipment);

    /**
     * Maps EquipmentRequest → Equipment entity for CREATE.
     * gym is set by the service after mapping.
     */
    @Mapping(target = "id",        ignore = true)
    @Mapping(target = "gym",       ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Equipment toEquipment(EquipmentRequest request);

    /**
     * Updates an existing Equipment entity from a request (for PUT).
     * Does not touch id, gym, or timestamps.
     */
    @Mapping(target = "id",        ignore = true)
    @Mapping(target = "gym",       ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEquipmentFromRequest(EquipmentRequest request, @MappingTarget Equipment equipment);
}
