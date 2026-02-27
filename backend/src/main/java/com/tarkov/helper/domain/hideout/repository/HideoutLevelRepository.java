package com.tarkov.helper.domain.hideout.repository;

import com.tarkov.helper.domain.hideout.entity.HideoutLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface HideoutLevelRepository extends JpaRepository<HideoutLevel, Long> {

    @Query("SELECT l FROM HideoutLevel l " +
            "JOIN FETCH l.station " +
            "WHERE l.station.apiId = :stationApiId " +
            "ORDER BY l.level")
    List<HideoutLevel> findByStationApiIdWithRequirements(@Param("stationApiId") String stationApiId);
}
