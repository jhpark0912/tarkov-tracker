package com.tarkov.helper.domain.map.repository;

import com.tarkov.helper.domain.map.entity.GameMap;
import com.tarkov.helper.domain.map.entity.MapFloor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MapFloorRepository extends JpaRepository<MapFloor, Long> {
    List<MapFloor> findByGameMapOrderByFloorOrder(GameMap gameMap);

    // 파생 삭제(deleteByGameMap) 대신 JPQL 벌크 DELETE 사용.
    // flushAutomatically=true: 실행 전 pending 작업 flush → DELETE가 INSERT보다 먼저 실행됨
    // (Hibernate 기본 액션 큐는 INSERT→UPDATE→DELETE 순서라 unique constraint 위반 발생)
    @Modifying(flushAutomatically = true)
    @Query("DELETE FROM MapFloor m WHERE m.gameMap = :map")
    void deleteByGameMap(@Param("map") GameMap map);
}
