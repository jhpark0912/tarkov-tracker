package com.tarkov.helper.domain.quest.repository;

import com.tarkov.helper.domain.quest.entity.Quest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface QuestRepository extends JpaRepository<Quest, Long> {

    Optional<Quest> findByApiId(String apiId);

    List<Quest> findByRemovedFalse();

    long countByRemovedFalse();

    @Query("SELECT q.apiId FROM Quest q WHERE q.removed = false")
    Set<String> findAllActiveApiIds();

    @Query("SELECT DISTINCT q FROM Quest q " +
            "LEFT JOIN FETCH q.trader t " +
            "LEFT JOIN FETCH q.map m " +
            "WHERE q.removed = false " +
            "AND (:traderId IS NULL OR t.id = :traderId) " +
            "AND (:kappaRequired IS NULL OR q.kappaRequired = :kappaRequired) " +
            "AND (:mapId IS NULL OR m.id = :mapId)")
    List<Quest> findWithFilters(@Param("traderId") Long traderId,
                                @Param("kappaRequired") Boolean kappaRequired,
                                @Param("mapId") Long mapId);

    @Query("SELECT q FROM Quest q " +
            "LEFT JOIN FETCH q.trader " +
            "LEFT JOIN FETCH q.map " +
            "WHERE q.id = :id AND q.removed = false")
    Optional<Quest> findByIdWithDetails(@Param("id") Long id);
}
