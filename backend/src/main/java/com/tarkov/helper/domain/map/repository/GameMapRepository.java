package com.tarkov.helper.domain.map.repository;

import com.tarkov.helper.domain.map.entity.GameMap;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GameMapRepository extends JpaRepository<GameMap, Long> {
    Optional<GameMap> findByApiId(String apiId);
    Optional<GameMap> findByNormalizedName(String normalizedName);
}
