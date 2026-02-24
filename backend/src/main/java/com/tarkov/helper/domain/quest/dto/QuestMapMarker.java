package com.tarkov.helper.domain.quest.dto;

import com.tarkov.helper.domain.quest.entity.QuestObjective;
import com.tarkov.helper.domain.quest.entity.QuestObjectiveItem;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class QuestMapMarker {
    private Long questId;
    private String questName;
    private Long objectiveId;
    private String objectiveDescription;
    private String objectiveType;
    private String traderName;
    private String floorId;
    private Double positionX;
    private Double positionY;
    private Boolean kappaRequired;
    private List<MarkerItemDto> requiredItems;

    @Getter
    @Builder
    public static class MarkerItemDto {
        private String itemName;
        private String iconUrl;
        private Integer count;
        private Boolean foundInRaid;
    }

    public static QuestMapMarker from(QuestObjective objective) {
        return QuestMapMarker.builder()
                .questId(objective.getQuest().getId())
                .questName(objective.getQuest().getName())
                .objectiveId(objective.getId())
                .objectiveDescription(objective.getDescription())
                .objectiveType(objective.getType())
                .traderName(objective.getQuest().getTrader() != null
                        ? objective.getQuest().getTrader().getName() : null)
                .floorId(objective.getFloorId())
                .positionX(objective.getPositionX())
                .positionY(objective.getPositionY())
                .kappaRequired(objective.getQuest().getKappaRequired())
                .requiredItems(objective.getRequiredItems().stream()
                        .map(item -> MarkerItemDto.builder()
                                .itemName(item.getItem().getName())
                                .iconUrl(item.getItem().getIconUrl())
                                .count(item.getCount())
                                .foundInRaid(item.getFoundInRaid())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}
