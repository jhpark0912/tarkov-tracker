package com.tarkov.helper.sync.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
public class CoordinateConverter {

    public record MapBounds(double[][] bounds) {}

    public record FloorRange(String floorId, double yMin, double yMax) {}

    public record FloorZone(double xMin, double xMax, double zMin, double zMax,
                            List<FloorRange> floorRanges) {}

    public record ConvertedPosition(Double positionX, Double positionY, String floorId) {}

    public ConvertedPosition convert(double gameX, double gameY, double gameZ,
                                     double[][] bounds, int coordinateRotation,
                                     List<FloorRange> floorRanges,
                                     List<FloorZone> floorZones,
                                     String defaultFloor) {
        if (bounds == null || bounds.length < 2) {
            return new ConvertedPosition(null, null, defaultFloor);
        }

        double x1 = bounds[0][0], z1 = bounds[0][1];
        double x2 = bounds[1][0], z2 = bounds[1][1];

        double dx = x1 - x2;
        double dz = z2 - z1;

        if (Math.abs(dx) < 0.001 || Math.abs(dz) < 0.001) {
            return new ConvertedPosition(null, null, defaultFloor);
        }

        double leftPercent;
        double topPercent;

        switch (coordinateRotation) {
            case 90:
                // Factory: 축 교환 — Z→좌우, X→상하
                leftPercent = (z1 - gameZ) / (z1 - z2) * 100.0;
                topPercent = (gameX - x1) / (x2 - x1) * 100.0;
                break;
            case 270:
                // The Lab: 축 교환 + 상하반전 — Z→좌우, X→상하(반전)
                leftPercent = (gameZ - z1) / dz * 100.0;
                topPercent = (gameX - x2) / (x1 - x2) * 100.0;
                break;
            case 0:
                leftPercent = (gameX - x2) / (x1 - x2) * 100.0;
                topPercent = (z1 - gameZ) / (z1 - z2) * 100.0;
                break;
            default: // 180 (대부분 맵)
                leftPercent = (x1 - gameX) / dx * 100.0;
                topPercent = (gameZ - z1) / dz * 100.0;
                break;
        }

        leftPercent = Math.max(0, Math.min(100, leftPercent));
        topPercent = Math.max(0, Math.min(100, topPercent));

        String floorId = detectFloor(gameX, gameY, gameZ, floorRanges, floorZones, defaultFloor);

        return new ConvertedPosition(leftPercent, topPercent, floorId);
    }

    private String detectFloor(double gameX, double gameY, double gameZ,
                               List<FloorRange> floorRanges,
                               List<FloorZone> floorZones,
                               String defaultFloor) {
        // 1) floorZones 우선 체크 (건물 영역 기반)
        if (floorZones != null) {
            for (FloorZone zone : floorZones) {
                if (gameX >= zone.xMin() && gameX <= zone.xMax() &&
                    gameZ >= zone.zMin() && gameZ <= zone.zMax()) {
                    for (FloorRange range : zone.floorRanges()) {
                        if (gameY >= range.yMin() && gameY < range.yMax()) {
                            return range.floorId();
                        }
                    }
                    return defaultFloor;
                }
            }
        }
        // 2) 기존 맵 레벨 floorRanges
        if (floorRanges != null && !floorRanges.isEmpty()) {
            for (FloorRange range : floorRanges) {
                if (gameY >= range.yMin() && gameY < range.yMax()) {
                    return range.floorId();
                }
            }
        }
        return defaultFloor;
    }
}
