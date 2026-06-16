package com.gymmanagement.gym_management.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Tracks a single gym visit for a member.
 * checkOutTime is nullable — a null value means the member is currently inside.
 */
@Entity
@Table(name = "attendances",
       indexes = {
           @Index(name = "idx_att_member_date", columnList = "member_id, attendance_date"),
           @Index(name = "idx_att_date",        columnList = "attendance_date")
       })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false)
    private LocalDate attendanceDate;

    @Column(nullable = false)
    private LocalTime checkInTime;

    /** Null means the member is still checked in */
    private LocalTime checkOutTime;
}
