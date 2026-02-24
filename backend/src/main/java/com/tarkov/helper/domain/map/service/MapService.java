package com.tarkov.helper.domain.map.service;

import com.tarkov.helper.domain.map.dto.MapDetail;
import com.tarkov.helper.domain.map.dto.MapListItem;
import com.tarkov.helper.domain.map.entity.GameMap;
import com.tarkov.helper.domain.map.entity.MapFloor;
import com.tarkov.helper.domain.map.repository.GameMapRepository;
import com.tarkov.helper.domain.map.repository.MapFloorRepository;
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
}
