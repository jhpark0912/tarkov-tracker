package com.tarkov.helper.domain.map.service;

import com.tarkov.helper.domain.map.dto.*;
import com.tarkov.helper.domain.map.entity.GameMap;
import com.tarkov.helper.domain.map.entity.MapFloor;
import com.tarkov.helper.domain.map.repository.*;
import com.tarkov.helper.global.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MapService {

    private final GameMapRepository gameMapRepository;
    private final MapFloorRepository mapFloorRepository;
    private final MapExtractRepository mapExtractRepository;
    private final MapLockRepository mapLockRepository;
    private final MapLootContainerRepository mapLootContainerRepository;

    public List<MapListItem> getMapList() {
        return gameMapRepository.findAll().stream()
                .map(MapListItem::from)
                .collect(Collectors.toList());
    }

    public MapDetail getMapDetail(String normalizedName) {
        GameMap map = gameMapRepository.findByNormalizedName(normalizedName)
                .orElseThrow(() -> new ResourceNotFoundException("맵을 찾을 수 없습니다: " + normalizedName));

        List<MapFloor> floors = mapFloorRepository.findByGameMapOrderByFloorOrder(map);
        return MapDetail.from(map, floors);
    }

    public MapPositionData getMapPositions(String normalizedName) {
        GameMap map = gameMapRepository.findByNormalizedName(normalizedName)
                .orElseThrow(() -> new ResourceNotFoundException("맵을 찾을 수 없습니다: " + normalizedName));

        List<MapExtractMarker> extracts = mapExtractRepository.findByGameMap(map).stream()
                .map(MapExtractMarker::from)
                .collect(Collectors.toList());

        List<MapLockMarker> locks = mapLockRepository.findByGameMap(map).stream()
                .map(MapLockMarker::from)
                .collect(Collectors.toList());

        List<MapLootContainerMarker> lootContainers = mapLootContainerRepository.findByGameMap(map).stream()
                .map(MapLootContainerMarker::from)
                .collect(Collectors.toList());

        return MapPositionData.builder()
                .extracts(extracts)
                .locks(locks)
                .lootContainers(lootContainers)
                .build();
    }
}
