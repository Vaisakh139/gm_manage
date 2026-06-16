package com.gymmanagement.gym_management.mapper;

import com.gymmanagement.gym_management.dto.gymowner.MemberResponse;
import com.gymmanagement.gym_management.dto.member.ProfileResponse;
import com.gymmanagement.gym_management.entity.Member;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MemberMapper {

    @Mapping(source = "user.id",                  target = "userId")
    @Mapping(source = "user.name",                target = "fullName")
    @Mapping(source = "user.email",               target = "email")
    @Mapping(source = "user.phone",               target = "phone")
    @Mapping(source = "user.active",              target = "active")
    @Mapping(source = "assignedTrainer.id",       target = "assignedTrainerId")
    @Mapping(source = "assignedTrainer.name",     target = "assignedTrainerName")
    MemberResponse toMemberResponse(Member member);

    @Mapping(source = "user.id",       target = "userId")
    @Mapping(source = "user.name",     target = "name")
    @Mapping(source = "user.email",    target = "email")
    @Mapping(source = "user.phone",    target = "phone")
    @Mapping(source = "gym.gymName",   target = "gymName")
    @Mapping(source = "status",        target = "memberStatus")
    ProfileResponse toProfileResponse(Member member);
}
