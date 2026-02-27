package com.tarkov.helper.domain.map.service;

import com.tarkov.helper.domain.map.dto.MapDetail;
import com.tarkov.helper.domain.map.dto.MapListItem;
import com.tarkov.helper.domain.map.dto.MapPositionData;
import com.tarkov.helper.domain.map.entity.GameMap;
import com.tarkov.helper.domain.map.entity.MapFloor;
import com.tarkov.helper.domain.map.repository.*;
import com.tarkov.helper.global.exception.ResourceNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class MapServiceTest {

    @Mock
    private GameMapRepository gameMapRepository;

    @Mock
    private MapFloorRepository mapFloorRepository;

    @Mock
    private MapExtractRepository mapExtractRepository;

    @Mock
    private MapLockRepository mapLockRepository;

    @Mock
    private MapLootContainerRepository mapLootContainerRepository;

    @InjectMocks
    private MapService mapService;

    private GameMap createMap(Long id, String name, String normalizedName) {
        return GameMap.builder()
                .id(id).apiId("map-" + id)
                .name(name).normalizedName(normalizedName)
                .svgFile(normalizedName + ".svg")
                .defaultFloor("Ground_Level")
                .coordinateRotation(180)
                .floors(new ArrayList<>())
                .build();
    }

    @Nested
    @DisplayName("getMapList")
    class GetMapList {

        @Test
        @DisplayName("전체 맵 목록 조회")
        void listAll() {
            GameMap customs = createMap(1L, "Customs", "customs");
            GameMap factory = createMap(2L, "Factory", "factory");

            given(gameMapRepository.findAll()).willReturn(List.of(customs, factory));

            List<MapListItem> result = mapService.getMapList();

            assertThat(result).hasSize(2);
            assertThat(result.get(0).getName()).isEqualTo("Customs");
            assertThat(result.get(1).getName()).isEqualTo("Factory");
        }

        @Test
        @DisplayName("맵이 없으면 빈 리스트 반환")
        void emptyList() {
            given(gameMapRepository.findAll()).willReturn(List.of());

            List<MapListItem> result = mapService.getMapList();

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("getMapDetail")
    class GetMapDetail {

        @Test
        @DisplayName("정상 조회 - 층 정보 포함")
        void mapDetailSuccess() {
            GameMap customs = createMap(1L, "Customs", "customs");
            MapFloor floor1 = MapFloor.builder()
                    .id(1L).gameMap(customs).floorId("Ground_Level")
                    .floorLabel("1층").floorOrder(0).floorImage("customs_ground.svg")
                    .build();

            given(gameMapRepository.findByNormalizedName("customs")).willReturn(Optional.of(customs));
            given(mapFloorRepository.findByGameMapOrderByFloorOrder(customs)).willReturn(List.of(floor1));

            MapDetail detail = mapService.getMapDetail("customs");

            assertThat(detail.getName()).isEqualTo("Customs");
            assertThat(detail.getNormalizedName()).isEqualTo("customs");
            assertThat(detail.getFloors()).hasSize(1);
            assertThat(detail.getFloors().get(0).getFloorId()).isEqualTo("Ground_Level");
        }

        @Test
        @DisplayName("존재하지 않는 맵 조회 시 ResourceNotFoundException")
        void mapNotFound() {
            given(gameMapRepository.findByNormalizedName("nonexistent")).willReturn(Optional.empty());

            assertThatThrownBy(() -> mapService.getMapDetail("nonexistent"))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("getMapPositions")
    class GetMapPositions {

        @Test
        @DisplayName("정상 조회 - 빈 포지션 데이터")
        void emptyPositions() {
            GameMap customs = createMap(1L, "Customs", "customs");

            given(gameMapRepository.findByNormalizedName("customs")).willReturn(Optional.of(customs));
            given(mapExtractRepository.findByGameMap(customs)).willReturn(List.of());
            given(mapLockRepository.findByGameMap(customs)).willReturn(List.of());
            given(mapLootContainerRepository.findByGameMap(customs)).willReturn(List.of());

            MapPositionData positions = mapService.getMapPositions("customs");

            assertThat(positions.getExtracts()).isEmpty();
            assertThat(positions.getLocks()).isEmpty();
            assertThat(positions.getLootContainers()).isEmpty();
        }

        @Test
        @DisplayName("존재하지 않는 맵 조회 시 ResourceNotFoundException")
        void mapNotFound() {
            given(gameMapRepository.findByNormalizedName("nonexistent")).willReturn(Optional.empty());

            assertThatThrownBy(() -> mapService.getMapPositions("nonexistent"))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}
