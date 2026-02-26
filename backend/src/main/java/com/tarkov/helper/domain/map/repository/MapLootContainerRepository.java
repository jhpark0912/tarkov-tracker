package com.tarkov.helper.domain.map.repository;

import com.tarkov.helper.domain.map.entity.GameMap;
import com.tarkov.helper.domain.map.entity.MapLootContainer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MapLootContainerRepository extends JpaRepository<MapLootContainer, Long> {
    List<MapLootContainer> findByGameMap(GameMap gameMap);

    @Modifying(flushAutomatically = true)
    @Query("DELETE FROM MapLootContainer c WHERE c.gameMap = :map")
    void deleteByGameMap(@Param("map") GameMap map);
}
