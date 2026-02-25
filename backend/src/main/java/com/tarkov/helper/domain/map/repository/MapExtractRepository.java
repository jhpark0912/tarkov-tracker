package com.tarkov.helper.domain.map.repository;

import com.tarkov.helper.domain.map.entity.GameMap;
import com.tarkov.helper.domain.map.entity.MapExtract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MapExtractRepository extends JpaRepository<MapExtract, Long> {
    List<MapExtract> findByGameMap(GameMap gameMap);

    @Modifying(flushAutomatically = true)
    @Query("DELETE FROM MapExtract e WHERE e.gameMap = :map")
    void deleteByGameMap(@Param("map") GameMap map);
}
