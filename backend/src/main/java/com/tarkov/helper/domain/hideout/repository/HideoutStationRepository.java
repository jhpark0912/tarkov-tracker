package com.tarkov.helper.domain.hideout.repository;

import com.tarkov.helper.domain.hideout.entity.HideoutStation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface HideoutStationRepository extends JpaRepository<HideoutStation, Long> {

    Optional<HideoutStation> findByApiId(String apiId);

    @Query("SELECT DISTINCT s FROM HideoutStation s LEFT JOIN FETCH s.levels ORDER BY s.name")
    List<HideoutStation> findAllWithLevels();
}
