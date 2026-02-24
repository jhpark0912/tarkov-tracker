package com.tarkov.helper.domain.map.repository;

import com.tarkov.helper.domain.map.entity.GameMap;
import com.tarkov.helper.domain.map.entity.MapFloor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MapFloorRepository extends JpaRepository<MapFloor, Long> {
    List<MapFloor> findByGameMapOrderByFloorOrder(GameMap gameMap);
    void deleteByGameMap(GameMap gameMap);
}
