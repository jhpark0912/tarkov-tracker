package com.tarkov.helper.domain.quest.entity;

import com.tarkov.helper.domain.item.entity.Item;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "quest_objective_items")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestObjectiveItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "objective_id", nullable = false)
    private QuestObjective objective;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Builder.Default
    private Integer count = 1;

    @Builder.Default
    @Column(name = "found_in_raid")
    private Boolean foundInRaid = false;
}
