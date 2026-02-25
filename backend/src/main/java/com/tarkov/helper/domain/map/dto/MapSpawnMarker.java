package com.tarkov.helper.domain.map.dto;

import com.tarkov.helper.domain.map.entity.MapSpawn;
import lombok.Builder;
import lombok.Getter;

import java.util.Arrays;
import java.util.List;

@Getter
@Builder
public class MapSpawnMarker {
    private final String zoneName;
    private final List<String> sides;
    private final List<String> categories;
    private final String floorId;
    private final Double positionX;
    private final Double positionY;

    public static MapSpawnMarker from(MapSpawn entity) {
        return MapSpawnMarker.builder()
                .zoneName(entity.getZoneName())
                .sides(entity.getSides() != null ? Arrays.asList(entity.getSides().split(",")) : List.of())
                .categories(entity.getCategories() != null ? Arrays.asList(entity.getCategories().split(",")) : List.of())
                .floorId(entity.getFloorId())
                .positionX(entity.getPositionX())
                .positionY(entity.getPositionY())
                .build();
    }
}
