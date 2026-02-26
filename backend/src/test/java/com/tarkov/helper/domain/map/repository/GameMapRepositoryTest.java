package com.tarkov.helper.domain.map.repository;

import com.tarkov.helper.domain.map.entity.GameMap;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class GameMapRepositoryTest {

    @Autowired
    private GameMapRepository gameMapRepository;

    @BeforeEach
    void setUp() {
        gameMapRepository.deleteAll();

        gameMapRepository.save(GameMap.builder()
                .apiId("customs-id").name("Customs").normalizedName("customs")
                .svgFile("customs.svg").defaultFloor("Ground_Level").coordinateRotation(180)
                .build());
        gameMapRepository.save(GameMap.builder()
                .apiId("factory-id").name("Factory").normalizedName("factory")
                .svgFile("factory.svg").defaultFloor("Ground_Level").coordinateRotation(90)
                .build());
    }

    @Test
    @DisplayName("findByNormalizedName: 정상 조회")
    void findByNormalizedName() {
        Optional<GameMap> found = gameMapRepository.findByNormalizedName("customs");

        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Customs");
        assertThat(found.get().getCoordinateRotation()).isEqualTo(180);
    }

    @Test
    @DisplayName("findByNormalizedName: 존재하지 않는 맵")
    void findByNormalizedNameNotFound() {
        Optional<GameMap> found = gameMapRepository.findByNormalizedName("nonexistent");

        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("findByApiId: 정상 조회")
    void findByApiId() {
        Optional<GameMap> found = gameMapRepository.findByApiId("factory-id");

        assertThat(found).isPresent();
        assertThat(found.get().getNormalizedName()).isEqualTo("factory");
    }
}
