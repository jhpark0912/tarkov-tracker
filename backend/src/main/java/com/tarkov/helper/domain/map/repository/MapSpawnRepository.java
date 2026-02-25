package com.tarkov.helper.domain.map.repository;

import com.tarkov.helper.domain.map.entity.GameMap;
import com.tarkov.helper.domain.map.entity.MapSpawn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MapSpawnRepository extends JpaRepository<MapSpawn, Long> {
    List<MapSpawn> findByGameMap(GameMap gameMap);

    @Modifying(flushAutomatically = true)
    @Query("DELETE FROM MapSpawn s WHERE s.gameMap = :map")
    void deleteByGameMap(@Param("map") GameMap map);
}
