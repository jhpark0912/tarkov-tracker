package com.tarkov.helper.domain.quest.repository;

import com.tarkov.helper.domain.quest.entity.Quest;
import com.tarkov.helper.domain.quest.entity.QuestPrerequisite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QuestPrerequisiteRepository extends JpaRepository<QuestPrerequisite, Long> {

    void deleteByQuest(Quest quest);

    @Query("SELECT p FROM QuestPrerequisite p LEFT JOIN FETCH p.prereqQuest WHERE p.quest = :quest")
    List<QuestPrerequisite> findByQuestWithPrereqs(@Param("quest") Quest quest);
}
