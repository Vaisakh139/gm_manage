package com.gymmanagement.gym_management.mapper;

import com.gymmanagement.gym_management.dto.admin.GymResponse;
import com.gymmanagement.gym_management.dto.pub.GymPublicResponse;
import com.gymmanagement.gym_management.entity.Gym;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * MapStruct mapper — converts {@link Gym} entity to admin and public-facing DTOs.
 *
 * <p>Nested owner fields ({@code gym.owner.id}, etc.) are resolved by MapStruct
 * automatically using dot-notation in the {@code source} attribute.</p>
 */
@Mapper(componentModel = "spring")
public interface GymMapper {

    /**
     * Maps Gym → GymResponse (used by admin endpoints).
     * Owner sub-fields are extracted from the nested {@code Gym.owner} (User) entity.
     */
    @Mapping(source = "owner.id",     target = "ownerId")
    @Mapping(source = "owner.name",   target = "ownerName")
    @Mapping(source = "owner.email",  target = "ownerEmail")
    @Mapping(source = "owner.active", target = "ownerActive")
    GymResponse toGymResponse(Gym gym);

    /**
     * Maps Gym → GymPublicResponse (used by the unauthenticated landing page).
     *
     * <p>{@code totalMembers} cannot be derived from the entity alone — it requires
     * a repository count.  It is therefore ignored here and injected by the service
     * after mapping via {@link GymPublicResponse#setTotalMembers(long)}.</p>
     */
    @Mapping(source = "owner.name", target = "ownerName")
    @Mapping(target = "totalMembers", ignore = true)
    GymPublicResponse toGymPublicResponse(Gym gym);
}
