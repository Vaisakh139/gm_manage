package com.gymmanagement.gym_management.mapper;

import com.gymmanagement.gym_management.dto.admin.UserResponse;
import com.gymmanagement.gym_management.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * MapStruct mapper — converts {@link User} entity to {@link UserResponse} DTO.
 *
 * <p>{@code componentModel = "spring"} tells MapStruct to generate a Spring
 * {@code @Component} so the mapper can be injected with {@code @Autowired} /
 * Lombok's {@code @RequiredArgsConstructor}.</p>
 */
@Mapper(componentModel = "spring")
public interface UserMapper {

    /**
     * Maps a User entity to a UserResponse DTO.
     *
     * <p>The {@code role} field is a {@link com.gymmanagement.gym_management.entity.Role}
     * enum in the entity but a plain {@code String} in the DTO, so we use a SpEL
     * expression to call {@code .name()} on the enum value.</p>
     */
    @Mapping(target = "role", expression = "java(user.getRole().name())")
    UserResponse toUserResponse(User user);
}
