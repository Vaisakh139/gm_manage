package com.gymmanagement.gym_management.dto.equipment;

import com.gymmanagement.gym_management.entity.EquipmentStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class EquipmentResponse {
    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private Integer quantity;
    private EquipmentStatus status;
    private Long gymId;
    private String gymName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
