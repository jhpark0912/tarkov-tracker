package com.tarkov.helper.sync.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
public class CoordinateConverter {

    public record MapBounds(double[][] bounds) {}

    public record FloorRange(String floorId, double yMin, double yMax) {}

    public record ConvertedPosition(Double positionX, Double positionY, String floorId) {}

    public ConvertedPosition convert(double gameX, double gameY, double gameZ,
                                     double[][] bounds, int coordinateRotation,
                                     List<FloorRange> floorRanges, String defaultFloor) {
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

        String floorId = detectFloor(gameY, floorRanges, defaultFloor);

        return new ConvertedPosition(leftPercent, topPercent, floorId);
    }

    private String detectFloor(double gameY, List<FloorRange> floorRanges, String defaultFloor) {
        if (floorRanges == null || floorRanges.isEmpty()) {
            return defaultFloor;
        }
        for (FloorRange range : floorRanges) {
            if (gameY >= range.yMin() && gameY < range.yMax()) {
                return range.floorId();
            }
        }
        return defaultFloor;
    }
}
