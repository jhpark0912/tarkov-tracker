package com.tarkov.helper.sync.service;

import com.tarkov.helper.domain.map.entity.*;
import com.tarkov.helper.domain.map.repository.*;
import com.tarkov.helper.sync.dto.TarkovMapDto;
import com.tarkov.helper.sync.dto.TarkovMapDto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MapPositionSyncService {

    private final MapExtractRepository mapExtractRepository;
    private final MapLockRepository mapLockRepository;
    private final MapSpawnRepository mapSpawnRepository;
    private final CoordinateConverter coordinateConverter;

    public record MapPositionMeta(double[][] bounds, int coordinateRotation,
                                  List<CoordinateConverter.FloorRange> floorRanges,
                                  String defaultFloor) {}

    public int[] syncMapPositions(List<TarkovMapDto> apiMaps,
                                  Map<String, GameMap> mapCache,
                                  Map<String, MapPositionMeta> metaMap) {
        int extractCount = 0, lockCount = 0, spawnCount = 0;

        for (TarkovMapDto dto : apiMaps) {
            GameMap gameMap = mapCache.get(dto.getId());
            if (gameMap == null) continue;

            MapPositionMeta meta = metaMap.getOrDefault(dto.getNormalizedName(), null);
            double[][] bounds = meta != null ? meta.bounds() : null;
            int rotation = meta != null ? meta.coordinateRotation() : 180;
            List<CoordinateConverter.FloorRange> floorRanges = meta != null ? meta.floorRanges() : null;
            String defaultFloor = meta != null ? meta.defaultFloor() : null;

            // 탈출구
            if (dto.getExtracts() != null) {
                mapExtractRepository.deleteByGameMap(gameMap);
                for (TarkovExtractDto ext : dto.getExtracts()) {
                    CoordinateConverter.ConvertedPosition pos = convertPosition(ext.getPosition(), bounds, rotation, floorRanges, defaultFloor);
                    mapExtractRepository.save(MapExtract.builder()
                            .gameMap(gameMap)
                            .apiId(ext.getId())
                            .name(ext.getName())
                            .faction(ext.getFaction())
                            .floorId(pos.floorId())
                            .positionX(pos.positionX())
                            .positionY(pos.positionY())
                            .build());
                    extractCount++;
                }
            }

            // 잠긴 문
            if (dto.getLocks() != null) {
                mapLockRepository.deleteByGameMap(gameMap);
                for (TarkovLockDto lock : dto.getLocks()) {
                    CoordinateConverter.ConvertedPosition pos = convertPosition(lock.getPosition(), bounds, rotation, floorRanges, defaultFloor);
                    TarkovKeyDto key = lock.getKey();
                    mapLockRepository.save(MapLock.builder()
                            .gameMap(gameMap)
                            .lockType(lock.getLockType())
                            .needsPower(lock.getNeedsPower())
                            .keyApiId(key != null ? key.getId() : null)
                            .keyName(key != null ? key.getName() : null)
                            .keyShortName(key != null ? key.getShortName() : null)
                            .keyIconUrl(key != null ? key.getIconLink() : null)
                            .floorId(pos.floorId())
                            .positionX(pos.positionX())
                            .positionY(pos.positionY())
                            .build());
                    lockCount++;
                }
            }

            // 스폰 포인트
            if (dto.getSpawns() != null) {
                mapSpawnRepository.deleteByGameMap(gameMap);
                for (TarkovSpawnDto spawn : dto.getSpawns()) {
                    CoordinateConverter.ConvertedPosition pos = convertPosition(spawn.getPosition(), bounds, rotation, floorRanges, defaultFloor);
                    String sides = spawn.getSides() != null ? String.join(",", spawn.getSides()) : null;
                    String categories = spawn.getCategories() != null ? String.join(",", spawn.getCategories()) : null;
                    mapSpawnRepository.save(MapSpawn.builder()
                            .gameMap(gameMap)
                            .zoneName(spawn.getZoneName())
                            .sides(sides)
                            .categories(categories)
                            .floorId(pos.floorId())
                            .positionX(pos.positionX())
                            .positionY(pos.positionY())
                            .build());
                    spawnCount++;
                }
            }
        }

        log.info("맵 위치 동기화 완료: 탈출구 {}건, 잠금 {}건, 스폰 {}건", extractCount, lockCount, spawnCount);
        return new int[]{extractCount, lockCount, spawnCount};
    }

    private CoordinateConverter.ConvertedPosition convertPosition(
            TarkovPositionDto position, double[][] bounds, int rotation,
            List<CoordinateConverter.FloorRange> floorRanges, String defaultFloor) {
        if (position == null || position.getX() == null || position.getZ() == null) {
            return new CoordinateConverter.ConvertedPosition(null, null, defaultFloor);
        }
        if (bounds == null) {
            return new CoordinateConverter.ConvertedPosition(null, null, defaultFloor);
        }
        double gameY = position.getY() != null ? position.getY() : 0;
        return coordinateConverter.convert(
                position.getX(), gameY, position.getZ(),
                bounds, rotation, floorRanges, defaultFloor);
    }
}
