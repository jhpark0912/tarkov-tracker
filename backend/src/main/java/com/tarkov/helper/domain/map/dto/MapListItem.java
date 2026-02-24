package com.tarkov.helper.domain.map.dto;

import com.tarkov.helper.domain.map.entity.GameMap;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MapListItem {
    private Long id;
    private String name;
    private String normalizedName;
    private String svgFile;
    private String defaultFloor;

    public static MapListItem from(GameMap map) {
        return MapListItem.builder()
                .id(map.getId())
                .name(map.getName())
                .normalizedName(map.getNormalizedName())
                .svgFile(map.getSvgFile())
                .defaultFloor(map.getDefaultFloor())
                .build();
    }
}
