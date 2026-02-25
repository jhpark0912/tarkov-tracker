package com.tarkov.helper.domain.map.dto;

import com.tarkov.helper.domain.map.entity.MapExtract;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MapExtractMarker {
    private final String name;
    private final String faction;
    private final String floorId;
    private final Double positionX;
    private final Double positionY;

    public static MapExtractMarker from(MapExtract entity) {
        return MapExtractMarker.builder()
                .name(entity.getName())
                .faction(entity.getFaction())
                .floorId(entity.getFloorId())
                .positionX(entity.getPositionX())
                .positionY(entity.getPositionY())
                .build();
    }
}
