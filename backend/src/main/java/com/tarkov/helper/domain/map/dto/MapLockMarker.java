package com.tarkov.helper.domain.map.dto;

import com.tarkov.helper.domain.map.entity.MapLock;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MapLockMarker {
    private final String lockType;
    private final Boolean needsPower;
    private final String keyApiId;
    private final String keyName;
    private final String keyShortName;
    private final String keyIconUrl;
    private final String floorId;
    private final Double positionX;
    private final Double positionY;

    public static MapLockMarker from(MapLock entity) {
        return MapLockMarker.builder()
                .lockType(entity.getLockType())
                .needsPower(entity.getNeedsPower())
                .keyApiId(entity.getKeyApiId())
                .keyName(entity.getKeyName())
                .keyShortName(entity.getKeyShortName())
                .keyIconUrl(entity.getKeyIconUrl())
                .floorId(entity.getFloorId())
                .positionX(entity.getPositionX())
                .positionY(entity.getPositionY())
                .build();
    }
}
