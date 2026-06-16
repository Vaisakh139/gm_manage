package com.gymmanagement.gym_management.dto.attendance;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class AttendanceResponse {
    private Long id;
    private Long memberId;
    private String memberName;
    private String memberEmail;
    private LocalDate attendanceDate;
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    /** True when checkOutTime is null */
    private boolean active;
}
