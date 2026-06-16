package com.gymmanagement.gym_management.dto.attendance;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AttendanceRequest {

    @NotNull(message = "Member ID is required")
    private Long memberId;

    /** Defaults to today if not provided */
    private LocalDate attendanceDate;

    /** Defaults to current time if not provided */
    private LocalTime checkInTime;
}
