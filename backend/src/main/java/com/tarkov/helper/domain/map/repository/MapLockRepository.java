package com.tarkov.helper.domain.map.repository;

import com.tarkov.helper.domain.map.entity.GameMap;
import com.tarkov.helper.domain.map.entity.MapLock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MapLockRepository extends JpaRepository<MapLock, Long> {
    List<MapLock> findByGameMap(GameMap gameMap);

    @Modifying(flushAutomatically = true)
    @Query("DELETE FROM MapLock l WHERE l.gameMap = :map")
    void deleteByGameMap(@Param("map") GameMap map);

    List<MapLock> findByKeyApiId(String keyApiId);

    @Query("SELECT DISTINCT l.keyApiId FROM MapLock l WHERE l.keyApiId IS NOT NULL")
    List<String> findDistinctKeyApiIds();

    @Query("SELECT l FROM MapLock l JOIN FETCH l.gameMap WHERE l.keyApiId IS NOT NULL AND l.gameMap.id = :mapId")
    List<MapLock> findLocksWithKeys(@Param("mapId") Long mapId);

    @Query("SELECT l FROM MapLock l JOIN FETCH l.gameMap WHERE l.keyApiId IS NOT NULL")
    List<MapLock> findAllWithKeys();
}
