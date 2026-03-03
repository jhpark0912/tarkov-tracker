package com.tarkov.helper.domain.marker.dto;

import com.tarkov.helper.domain.marker.entity.MarkerType;
import com.tarkov.helper.domain.marker.entity.UserMapMarker;

import java.time.LocalDateTime;

public record MarkerResponse(
        Long id,
        Long mapId,
        String floorId,
        Double positionX,
        Double positionY,
        String title,
        String description,
        MarkerType type,
        String color,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static MarkerResponse from(UserMapMarker marker) {
        return new MarkerResponse(
                marker.getId(),
                marker.getMap().getId(),
                marker.getFloorId(),
                marker.getPositionX(),
                marker.getPositionY(),
                marker.getTitle(),
                marker.getDescription(),
                marker.getMarkerType(),
                marker.getColor(),
                marker.getCreatedAt(),
                marker.getUpdatedAt()
        );
    }
}
