package com.tarkov.helper.domain.quest.dto;

import com.tarkov.helper.domain.quest.entity.Quest;
import com.tarkov.helper.domain.trader.dto.TraderInfo;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class QuestListItem {
    private Long id;
    private String name;
    private TraderInfo trader;
    private String mapName;
    private Boolean kappaRequired;
    private Boolean lightkeeperRequired;
    private Integer minPlayerLevel;
    private Integer objectiveCount;

    public static QuestListItem from(Quest quest) {
        return QuestListItem.builder()
                .id(quest.getId())
                .name(quest.getName())
                .trader(TraderInfo.from(quest.getTrader()))
                .mapName(quest.getMap() != null ? quest.getMap().getName() : null)
                .kappaRequired(quest.getKappaRequired())
                .lightkeeperRequired(quest.getLightkeeperRequired())
                .minPlayerLevel(quest.getMinPlayerLevel())
                .objectiveCount(quest.getObjectives() != null ? quest.getObjectives().size() : 0)
                .build();
    }
}
