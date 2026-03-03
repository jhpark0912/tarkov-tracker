package com.tarkov.helper.domain.marker.dto;

import com.tarkov.helper.domain.marker.entity.MarkerType;
import jakarta.validation.constraints.*;

public record MarkerCreateRequest(
        @NotNull Long mapId,
        String floorId,
        @NotNull @DecimalMin("0.0") @DecimalMax("100.0") Double positionX,
        @NotNull @DecimalMin("0.0") @DecimalMax("100.0") Double positionY,
        @NotBlank @Size(max = 100) String title,
        @Size(max = 500) String description,
        @NotNull MarkerType type,
        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "색상은 #RRGGBB 형식이어야 합니다") String color
) {}
