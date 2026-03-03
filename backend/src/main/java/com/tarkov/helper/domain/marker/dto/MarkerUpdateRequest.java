package com.tarkov.helper.domain.marker.dto;

import com.tarkov.helper.domain.marker.entity.MarkerType;
import jakarta.validation.constraints.*;

public record MarkerUpdateRequest(
        @Size(max = 100) String title,
        @Size(max = 500) String description,
        MarkerType type,
        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "색상은 #RRGGBB 형식이어야 합니다") String color
) {}
