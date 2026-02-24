package com.tarkov.helper.domain.map.dto;

import com.tarkov.helper.domain.map.entity.MapFloor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MapFloorInfo {
    private String floorId;
    private String floorLabel;
    private Integer floorOrder;

    public static MapFloorInfo from(MapFloor floor) {
        return MapFloorInfo.builder()
                .floorId(floor.getFloorId())
                .floorLabel(floor.getFloorLabel())
                .floorOrder(floor.getFloorOrder())
                .build();
    }
}
