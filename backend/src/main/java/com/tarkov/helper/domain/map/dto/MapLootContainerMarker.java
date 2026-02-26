package com.tarkov.helper.domain.map.dto;

import com.tarkov.helper.domain.map.entity.MapLootContainer;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MapLootContainerMarker {
    private final String containerName;
    private final String normalizedName;
    private final String floorId;
    private final Double positionX;
    private final Double positionY;

    public static MapLootContainerMarker from(MapLootContainer entity) {
        return MapLootContainerMarker.builder()
                .containerName(entity.getContainerName())
                .normalizedName(entity.getNormalizedName())
                .floorId(entity.getFloorId())
                .positionX(entity.getPositionX())
                .positionY(entity.getPositionY())
                .build();
    }
}
