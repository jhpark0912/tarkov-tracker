package com.tarkov.helper.domain.quest.repository;

import com.tarkov.helper.domain.quest.entity.Quest;
import com.tarkov.helper.domain.quest.entity.QuestPrerequisite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QuestPrerequisiteRepository extends JpaRepository<QuestPrerequisite, Long> {

    // 파생 삭제 대신 JPQL 벌크 DELETE 사용 (Hibernate 액션 큐 INSERT→DELETE 순서 문제 방지)
    @Modifying(flushAutomatically = true)
    @Query("DELETE FROM QuestPrerequisite p WHERE p.quest = :quest")
    void deleteByQuest(@Param("quest") Quest quest);

    @Query("SELECT p FROM QuestPrerequisite p LEFT JOIN FETCH p.prereqQuest WHERE p.quest = :quest")
    List<QuestPrerequisite> findByQuestWithPrereqs(@Param("quest") Quest quest);

    @Query("SELECT p FROM QuestPrerequisite p " +
            "LEFT JOIN FETCH p.quest q " +
            "LEFT JOIN FETCH q.trader " +
            "LEFT JOIN FETCH q.map " +
            "WHERE p.prereqQuest = :prereqQuest AND q.removed = false")
    List<QuestPrerequisite> findByPrereqQuest(@Param("prereqQuest") Quest prereqQuest);

    @Query("SELECT p FROM QuestPrerequisite p " +
            "LEFT JOIN FETCH p.quest q " +
            "LEFT JOIN FETCH p.prereqQuest pq " +
            "LEFT JOIN FETCH q.trader " +
            "LEFT JOIN FETCH q.map " +
            "LEFT JOIN FETCH pq.trader " +
            "LEFT JOIN FETCH pq.map " +
            "WHERE q.removed = false AND pq.removed = false")
    List<QuestPrerequisite> findAllWithDetails();
}
