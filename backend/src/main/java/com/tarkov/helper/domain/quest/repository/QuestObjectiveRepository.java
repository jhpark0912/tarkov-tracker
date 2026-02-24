package com.tarkov.helper.domain.quest.repository;

import com.tarkov.helper.domain.quest.entity.Quest;
import com.tarkov.helper.domain.quest.entity.QuestObjective;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface QuestObjectiveRepository extends JpaRepository<QuestObjective, Long> {

    Optional<QuestObjective> findByApiId(String apiId);

    @Query("SELECT o FROM QuestObjective o LEFT JOIN FETCH o.requiredItems ri LEFT JOIN FETCH ri.item WHERE o.quest = :quest")
    List<QuestObjective> findByQuestWithItems(@Param("quest") Quest quest);

    @Query("SELECT o FROM QuestObjective o " +
            "LEFT JOIN FETCH o.quest q " +
            "LEFT JOIN FETCH q.trader " +
            "WHERE o.map.id = :mapId " +
            "AND (o.positionX IS NOT NULL OR o.positionY IS NOT NULL) " +
            "AND q.removed = false")
    List<QuestObjective> findMapMarkersForMap(@Param("mapId") Long mapId);
}
