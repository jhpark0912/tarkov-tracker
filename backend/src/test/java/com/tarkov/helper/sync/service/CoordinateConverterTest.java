package com.tarkov.helper.sync.service;

import com.tarkov.helper.sync.service.CoordinateConverter.ConvertedPosition;
import com.tarkov.helper.sync.service.CoordinateConverter.FloorRange;
import com.tarkov.helper.sync.service.CoordinateConverter.FloorZone;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

class CoordinateConverterTest {

    private CoordinateConverter converter;

    @BeforeEach
    void setUp() {
        converter = new CoordinateConverter();
    }

    @Nested
    @DisplayName("좌표 변환 - rotation별")
    class CoordinateRotation {

        private final double[][] bounds = {{100, 100}, {0, 0}};

        @Test
        @DisplayName("rotation 0: 정상 변환")
        void rotation0() {
            ConvertedPosition pos = converter.convert(50, 0, 50, bounds, 0, null, null, "default");

            assertThat(pos.positionX()).isCloseTo(50.0, within(0.1));
            assertThat(pos.positionY()).isCloseTo(50.0, within(0.1));
        }

        @Test
        @DisplayName("rotation 90 (Factory): 축 교환")
        void rotation90() {
            ConvertedPosition pos = converter.convert(50, 0, 50, bounds, 90, null, null, "default");

            assertThat(pos.positionX()).isNotNull();
            assertThat(pos.positionY()).isNotNull();
            assertThat(pos.positionX()).isBetween(0.0, 100.0);
            assertThat(pos.positionY()).isBetween(0.0, 100.0);
        }

        @Test
        @DisplayName("rotation 180 (대부분 맵): 정상 변환")
        void rotation180() {
            ConvertedPosition pos = converter.convert(50, 0, 50, bounds, 180, null, null, "default");

            assertThat(pos.positionX()).isCloseTo(50.0, within(0.1));
            assertThat(pos.positionY()).isCloseTo(50.0, within(0.1));
        }

        @Test
        @DisplayName("rotation 270 (The Lab): 축 교환 + 반전")
        void rotation270() {
            ConvertedPosition pos = converter.convert(50, 0, 50, bounds, 270, null, null, "default");

            assertThat(pos.positionX()).isNotNull();
            assertThat(pos.positionY()).isNotNull();
            assertThat(pos.positionX()).isBetween(0.0, 100.0);
            assertThat(pos.positionY()).isBetween(0.0, 100.0);
        }
    }

    @Nested
    @DisplayName("경계 조건")
    class BoundaryConditions {

        @Test
        @DisplayName("bounds가 null이면 null 좌표 반환")
        void nullBounds() {
            ConvertedPosition pos = converter.convert(50, 0, 50, null, 0, null, null, "default");

            assertThat(pos.positionX()).isNull();
            assertThat(pos.positionY()).isNull();
            assertThat(pos.floorId()).isEqualTo("default");
        }

        @Test
        @DisplayName("bounds 길이 부족하면 null 좌표 반환")
        void insufficientBounds() {
            double[][] bounds = {{100, 100}};
            ConvertedPosition pos = converter.convert(50, 0, 50, bounds, 0, null, null, "default");

            assertThat(pos.positionX()).isNull();
            assertThat(pos.positionY()).isNull();
        }

        @Test
        @DisplayName("범위 바깥 좌표는 0~100으로 클램핑")
        void clamping() {
            double[][] bounds = {{100, 100}, {0, 0}};
            // 범위 바깥의 큰 좌표값
            ConvertedPosition pos = converter.convert(200, 0, 200, bounds, 180, null, null, "default");

            assertThat(pos.positionX()).isBetween(0.0, 100.0);
            assertThat(pos.positionY()).isBetween(0.0, 100.0);
        }

        @Test
        @DisplayName("bounds 차이가 0에 가까우면 null 좌표 반환")
        void zeroDifferenceBounds() {
            double[][] bounds = {{50, 50}, {50, 50}};
            ConvertedPosition pos = converter.convert(50, 0, 50, bounds, 0, null, null, "default");

            assertThat(pos.positionX()).isNull();
            assertThat(pos.positionY()).isNull();
        }
    }

    @Nested
    @DisplayName("층 감지 (detectFloor)")
    class FloorDetection {

        private final double[][] bounds = {{100, 100}, {0, 0}};

        @Test
        @DisplayName("floorRanges가 null이면 defaultFloor 반환")
        void nullFloorRanges() {
            ConvertedPosition pos = converter.convert(50, 5, 50, bounds, 180, null, null, "Ground_Level");

            assertThat(pos.floorId()).isEqualTo("Ground_Level");
        }

        @Test
        @DisplayName("floorRanges가 빈 리스트이면 defaultFloor 반환")
        void emptyFloorRanges() {
            ConvertedPosition pos = converter.convert(50, 5, 50, bounds, 180, List.of(), null, "Ground_Level");

            assertThat(pos.floorId()).isEqualTo("Ground_Level");
        }

        @Test
        @DisplayName("Y좌표에 매칭되는 층 반환")
        void matchingFloor() {
            List<FloorRange> ranges = List.of(
                    new FloorRange("Underground", -10, 0),
                    new FloorRange("Ground", 0, 10),
                    new FloorRange("Floor2", 10, 20)
            );

            ConvertedPosition pos = converter.convert(50, 5, 50, bounds, 180, ranges, null, "Ground");

            assertThat(pos.floorId()).isEqualTo("Ground");
        }

        @Test
        @DisplayName("어떤 범위에도 해당하지 않으면 defaultFloor 반환")
        void noMatchingFloor() {
            List<FloorRange> ranges = List.of(
                    new FloorRange("Underground", -10, 0),
                    new FloorRange("Ground", 0, 10)
            );

            ConvertedPosition pos = converter.convert(50, 50, 50, bounds, 180, ranges, null, "default");

            assertThat(pos.floorId()).isEqualTo("default");
        }
    }

    @Nested
    @DisplayName("Reserve 층 감지 (floorRanges)")
    class ReserveFloorDetection {

        private final double[][] bounds = {{289, -338}, {-303, 336}};

        @Test
        @DisplayName("벙커 Y좌표(-17) → Bunkers 층")
        void bunkerExtract() {
            List<FloorRange> ranges = List.of(
                    new FloorRange("Bunkers", -99, -8),
                    new FloorRange("Ground_Level", -8, 99)
            );

            ConvertedPosition pos = converter.convert(0, -17, 0, bounds, 180, ranges, null, "Ground_Level");

            assertThat(pos.floorId()).isEqualTo("Bunkers");
        }

        @Test
        @DisplayName("지상 Y좌표(5) → Ground_Level 층")
        void groundExtract() {
            List<FloorRange> ranges = List.of(
                    new FloorRange("Bunkers", -99, -8),
                    new FloorRange("Ground_Level", -8, 99)
            );

            ConvertedPosition pos = converter.convert(0, 5, 0, bounds, 180, ranges, null, "Ground_Level");

            assertThat(pos.floorId()).isEqualTo("Ground_Level");
        }
    }

    @Nested
    @DisplayName("Shoreline 층 감지 (floorZones)")
    class ShorelineFloorDetection {

        private final double[][] bounds = {{506, -405}, {-1060, 618}};

        private final List<FloorZone> floorZones = List.of(
                new FloorZone(-370, -135, -155, -65, List.of(
                        new FloorRange("Underground_Level", -99, -4.5),
                        new FloorRange("Ground_Level", -4.5, -1.5),
                        new FloorRange("Second_Floor", -1.5, 1.0),
                        new FloorRange("Third_Floor", 1.0, 99)
                ))
        );

        @Test
        @DisplayName("리조트 밖 야외 좌표 → defaultFloor (Ground_Level)")
        void outdoorPosition() {
            // 리조트 범위 밖 (X=100, Z=0)
            ConvertedPosition pos = converter.convert(100, 0, 0, bounds, 180, null, floorZones, "Ground_Level");

            assertThat(pos.floorId()).isEqualTo("Ground_Level");
        }

        @Test
        @DisplayName("리조트 지하 Y좌표(-7) → Underground_Level")
        void resortBasement() {
            // 리조트 범위 내 (X=-200, Z=-100)
            ConvertedPosition pos = converter.convert(-200, -7, -100, bounds, 180, null, floorZones, "Ground_Level");

            assertThat(pos.floorId()).isEqualTo("Underground_Level");
        }

        @Test
        @DisplayName("리조트 1층 Y좌표(-3) → Ground_Level")
        void resortFirstFloor() {
            ConvertedPosition pos = converter.convert(-200, -3, -100, bounds, 180, null, floorZones, "Ground_Level");

            assertThat(pos.floorId()).isEqualTo("Ground_Level");
        }

        @Test
        @DisplayName("리조트 2층 Y좌표(0) → Second_Floor")
        void resortSecondFloor() {
            ConvertedPosition pos = converter.convert(-200, 0, -100, bounds, 180, null, floorZones, "Ground_Level");

            assertThat(pos.floorId()).isEqualTo("Second_Floor");
        }

        @Test
        @DisplayName("리조트 3층 Y좌표(3) → Third_Floor")
        void resortThirdFloor() {
            ConvertedPosition pos = converter.convert(-200, 3, -100, bounds, 180, null, floorZones, "Ground_Level");

            assertThat(pos.floorId()).isEqualTo("Third_Floor");
        }

        @Test
        @DisplayName("floorZones와 floorRanges 동시 존재 시 floorZones 우선")
        void floorZonesPriorityOverRanges() {
            List<FloorRange> globalRanges = List.of(
                    new FloorRange("FallbackFloor", -99, 99)
            );

            // 리조트 내부 좌표 → floorZones가 우선
            ConvertedPosition pos = converter.convert(-200, 3, -100, bounds, 180, globalRanges, floorZones, "Ground_Level");

            assertThat(pos.floorId()).isEqualTo("Third_Floor");
        }

        @Test
        @DisplayName("floorZones 영역 밖이면 floorRanges로 fallback")
        void fallbackToFloorRanges() {
            List<FloorRange> globalRanges = List.of(
                    new FloorRange("FallbackFloor", -99, 99)
            );

            // 리조트 밖 좌표 → floorRanges로 fallback
            ConvertedPosition pos = converter.convert(100, 3, 0, bounds, 180, globalRanges, floorZones, "Ground_Level");

            assertThat(pos.floorId()).isEqualTo("FallbackFloor");
        }
    }
}
