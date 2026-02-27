package com.tarkov.helper.domain.hideout.repository;

import com.tarkov.helper.domain.hideout.entity.HideoutLevel;
import com.tarkov.helper.domain.hideout.entity.HideoutStation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface HideoutLevelRepository extends JpaRepository<HideoutLevel, Long> {

    @Query("SELECT l FROM HideoutLevel l " +
            "JOIN FETCH l.station " +
            "WHERE l.station.apiId = :stationApiId " +
            "ORDER BY l.level")
    List<HideoutLevel> findByStationApiIdWithRequirements(@Param("stationApiId") String stationApiId);

    Optional<HideoutLevel> findByStationAndLevel(HideoutStation station, Integer level);
}
