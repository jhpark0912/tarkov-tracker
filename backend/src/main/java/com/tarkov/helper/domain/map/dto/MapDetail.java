package com.tarkov.helper.domain.map.dto;

import com.tarkov.helper.domain.map.entity.GameMap;
import com.tarkov.helper.domain.map.entity.MapFloor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class MapDetail {
    private Long id;
    private String name;
    private String normalizedName;
    private String svgFile;
    private String defaultFloor;
    private Integer coordinateRotation;
    private List<MapFloorInfo> floors;

    public static MapDetail from(GameMap map, List<MapFloor> floors) {
        return MapDetail.builder()
                .id(map.getId())
                .name(map.getName())
                .normalizedName(map.getNormalizedName())
                .svgFile(map.getSvgFile())
                .defaultFloor(map.getDefaultFloor())
                .coordinateRotation(map.getCoordinateRotation())
                .floors(floors.stream().map(MapFloorInfo::from).collect(Collectors.toList()))
                .build();
    }
}
