package com.gymmanagement.gym_management.dto.equipment;

import com.gymmanagement.gym_management.entity.EquipmentStatus;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class EquipmentRequest {

    /** Required when creating via admin endpoint */
    private Long gymId;

    @NotBlank(message = "Equipment name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    private String imageUrl;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity must be >= 0")
    private Integer quantity;

    private EquipmentStatus status;
}
