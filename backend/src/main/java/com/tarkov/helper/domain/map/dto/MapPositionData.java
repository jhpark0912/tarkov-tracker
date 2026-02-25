package com.tarkov.helper.domain.map.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class MapPositionData {
    private final List<MapExtractMarker> extracts;
    private final List<MapLockMarker> locks;
    private final List<MapSpawnMarker> spawns;
}
