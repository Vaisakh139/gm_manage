package com.gymmanagement.gym_management.mapper;

import com.gymmanagement.gym_management.dto.attendance.AttendanceResponse;
import com.gymmanagement.gym_management.entity.Attendance;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AttendanceMapper {

    @Mapping(source = "member.id",         target = "memberId")
    @Mapping(source = "member.user.name",  target = "memberName")
    @Mapping(source = "member.user.email", target = "memberEmail")
    @Mapping(expression = "java(a.getCheckOutTime() == null)", target = "active")
    AttendanceResponse toResponse(Attendance a);
}
