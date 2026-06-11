package com.gymmanagement.gym_management.mapper;

import com.gymmanagement.gym_management.dto.gymowner.MemberResponse;
import com.gymmanagement.gym_management.dto.member.ProfileResponse;
import com.gymmanagement.gym_management.entity.Member;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * MapStruct mapper — converts {@link Member} entity to gym-owner and member-facing DTOs.
 *
 * <p>A Member entity has two nested relationships that this mapper traverses:</p>
 * <ul>
 *   <li>{@code member.user} — the linked {@link com.gymmanagement.gym_management.entity.User}</li>
 *   <li>{@code member.gym}  — the linked {@link com.gymmanagement.gym_management.entity.Gym}</li>
 * </ul>
 * <p>Both are lazily loaded by JPA; MapStruct accesses them within the existing
 * {@code @Transactional} service context so no {@code LazyInitializationException}
 * is thrown.</p>
 */
@Mapper(componentModel = "spring")
public interface MemberMapper {

    /**
     * Maps Member → MemberResponse (used by gym-owner member management endpoints).
     *
     * <ul>
     *   <li>{@code userId}   ← {@code member.user.id}</li>
     *   <li>{@code fullName} ← {@code member.user.name}</li>
     *   <li>{@code email}    ← {@code member.user.email}</li>
     *   <li>{@code phone}    ← {@code member.user.phone}</li>
     *   <li>{@code active}   ← {@code member.user.active} (account flag, not membership)</li>
     *   <li>All other fields map directly by name.</li>
     * </ul>
     */
    @Mapping(source = "user.id",     target = "userId")
    @Mapping(source = "user.name",   target = "fullName")
    @Mapping(source = "user.email",  target = "email")
    @Mapping(source = "user.phone",  target = "phone")
    @Mapping(source = "user.active", target = "active")
    MemberResponse toMemberResponse(Member member);

    /**
     * Maps Member → ProfileResponse (used by the member's own profile endpoint).
     *
     * <ul>
     *   <li>{@code userId}       ← {@code member.user.id}</li>
     *   <li>{@code name}         ← {@code member.user.name}</li>
     *   <li>{@code email}        ← {@code member.user.email}</li>
     *   <li>{@code phone}        ← {@code member.user.phone}</li>
     *   <li>{@code gymName}      ← {@code member.gym.gymName}</li>
     *   <li>{@code memberStatus} ← {@code member.status}  (renamed field)</li>
     * </ul>
     */
    @Mapping(source = "user.id",       target = "userId")
    @Mapping(source = "user.name",     target = "name")
    @Mapping(source = "user.email",    target = "email")
    @Mapping(source = "user.phone",    target = "phone")
    @Mapping(source = "gym.gymName",   target = "gymName")
    @Mapping(source = "status",        target = "memberStatus")
    ProfileResponse toProfileResponse(Member member);
}
