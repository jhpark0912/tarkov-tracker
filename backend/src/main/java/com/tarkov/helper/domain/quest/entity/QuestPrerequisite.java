package com.tarkov.helper.domain.quest.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "quest_prerequisites", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"quest_id", "prereq_quest_id"})
})
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestPrerequisite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quest_id", nullable = false)
    private Quest quest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prereq_quest_id", nullable = false)
    private Quest prereqQuest;
}
