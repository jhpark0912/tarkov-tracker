package com.tarkov.helper.sync.service;

import com.tarkov.helper.sync.service.CoordinateConverter.ConvertedPosition;
import com.tarkov.helper.sync.service.CoordinateConverter.FloorRange;
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
            ConvertedPosition pos = converter.convert(50, 0, 50, bounds, 0, null, "default");

            assertThat(pos.positionX()).isCloseTo(50.0, within(0.1));
            assertThat(pos.positionY()).isCloseTo(50.0, within(0.1));
        }

        @Test
        @DisplayName("rotation 90 (Factory): 축 교환")
        void rotation90() {
            ConvertedPosition pos = converter.convert(50, 0, 50, bounds, 90, null, "default");

            assertThat(pos.positionX()).isNotNull();
            assertThat(pos.positionY()).isNotNull();
            assertThat(pos.positionX()).isBetween(0.0, 100.0);
            assertThat(pos.positionY()).isBetween(0.0, 100.0);
        }

        @Test
        @DisplayName("rotation 180 (대부분 맵): 정상 변환")
        void rotation180() {
            ConvertedPosition pos = converter.convert(50, 0, 50, bounds, 180, null, "default");

            assertThat(pos.positionX()).isCloseTo(50.0, within(0.1));
            assertThat(pos.positionY()).isCloseTo(50.0, within(0.1));
        }

        @Test
        @DisplayName("rotation 270 (The Lab): 축 교환 + 반전")
        void rotation270() {
            ConvertedPosition pos = converter.convert(50, 0, 50, bounds, 270, null, "default");

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
            ConvertedPosition pos = converter.convert(50, 0, 50, null, 0, null, "default");

            assertThat(pos.positionX()).isNull();
            assertThat(pos.positionY()).isNull();
            assertThat(pos.floorId()).isEqualTo("default");
        }

        @Test
        @DisplayName("bounds 길이 부족하면 null 좌표 반환")
        void insufficientBounds() {
            double[][] bounds = {{100, 100}};
            ConvertedPosition pos = converter.convert(50, 0, 50, bounds, 0, null, "default");

            assertThat(pos.positionX()).isNull();
            assertThat(pos.positionY()).isNull();
        }

        @Test
        @DisplayName("범위 바깥 좌표는 0~100으로 클램핑")
        void clamping() {
            double[][] bounds = {{100, 100}, {0, 0}};
            // 범위 바깥의 큰 좌표값
            ConvertedPosition pos = converter.convert(200, 0, 200, bounds, 180, null, "default");

            assertThat(pos.positionX()).isBetween(0.0, 100.0);
            assertThat(pos.positionY()).isBetween(0.0, 100.0);
        }

        @Test
        @DisplayName("bounds 차이가 0에 가까우면 null 좌표 반환")
        void zeroDifferenceBounds() {
            double[][] bounds = {{50, 50}, {50, 50}};
            ConvertedPosition pos = converter.convert(50, 0, 50, bounds, 0, null, "default");

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
            ConvertedPosition pos = converter.convert(50, 5, 50, bounds, 180, null, "Ground_Level");

            assertThat(pos.floorId()).isEqualTo("Ground_Level");
        }

        @Test
        @DisplayName("floorRanges가 빈 리스트이면 defaultFloor 반환")
        void emptyFloorRanges() {
            ConvertedPosition pos = converter.convert(50, 5, 50, bounds, 180, List.of(), "Ground_Level");

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

            ConvertedPosition pos = converter.convert(50, 5, 50, bounds, 180, ranges, "Ground");

            assertThat(pos.floorId()).isEqualTo("Ground");
        }

        @Test
        @DisplayName("어떤 범위에도 해당하지 않으면 defaultFloor 반환")
        void noMatchingFloor() {
            List<FloorRange> ranges = List.of(
                    new FloorRange("Underground", -10, 0),
                    new FloorRange("Ground", 0, 10)
            );

            ConvertedPosition pos = converter.convert(50, 50, 50, bounds, 180, ranges, "default");

            assertThat(pos.floorId()).isEqualTo("default");
        }
    }
}
