package com.tarkov.helper.domain.quest.dto;

import com.tarkov.helper.domain.item.entity.Item;
import com.tarkov.helper.domain.quest.entity.Quest;
import com.tarkov.helper.domain.quest.entity.QuestObjective;
import com.tarkov.helper.domain.quest.entity.QuestObjectiveItem;
import com.tarkov.helper.domain.quest.entity.QuestPrerequisite;
import com.tarkov.helper.domain.trader.dto.TraderInfo;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class QuestDetail {
    private Long id;
    private String name;
    private TraderInfo trader;
    private MapRef map;
    private Boolean kappaRequired;
    private Integer minPlayerLevel;
    private String wikiLink;
    private String taskImageLink;
    private Integer experience;
    private List<ObjectiveDto> objectives;
    private List<PrerequisiteDto> prerequisites;

    @Getter
    @Builder
    public static class MapRef {
        private Long id;
        private String name;
        private String normalizedName;
    }

    @Getter
    @Builder
    public static class ObjectiveDto {
        private Long id;
        private String type;
        private String description;
        private String mapName;
        private String floorId;
        private Double positionX;
        private Double positionY;
        private Boolean optional;
        private List<RequiredItemDto> requiredItems;
    }

    @Getter
    @Builder
    public static class RequiredItemDto {
        private ItemRef item;
        private Integer count;
        private Boolean foundInRaid;
    }

    @Getter
    @Builder
    public static class ItemRef {
        private Long id;
        private String name;
        private String shortName;
        private String iconUrl;
    }

    @Getter
    @Builder
    public static class PrerequisiteDto {
        private Long id;
        private String name;
    }

    public static QuestDetail from(Quest quest, List<QuestObjective> objectives,
                                   List<QuestPrerequisite> prerequisites) {
        return QuestDetail.builder()
                .id(quest.getId())
                .name(quest.getName())
                .trader(TraderInfo.from(quest.getTrader()))
                .map(quest.getMap() != null ? MapRef.builder()
                        .id(quest.getMap().getId())
                        .name(quest.getMap().getName())
                        .normalizedName(quest.getMap().getNormalizedName())
                        .build() : null)
                .kappaRequired(quest.getKappaRequired())
                .minPlayerLevel(quest.getMinPlayerLevel())
                .wikiLink(quest.getWikiLink())
                .taskImageLink(quest.getTaskImageLink())
                .experience(quest.getExperience())
                .objectives(objectives.stream().map(QuestDetail::toObjectiveDto).collect(Collectors.toList()))
                .prerequisites(prerequisites.stream().map(p -> PrerequisiteDto.builder()
                        .id(p.getPrereqQuest().getId())
                        .name(p.getPrereqQuest().getName())
                        .build()).collect(Collectors.toList()))
                .build();
    }

    private static ObjectiveDto toObjectiveDto(QuestObjective obj) {
        return ObjectiveDto.builder()
                .id(obj.getId())
                .type(obj.getType())
                .description(obj.getDescription())
                .mapName(obj.getMap() != null ? obj.getMap().getName() : null)
                .floorId(obj.getFloorId())
                .positionX(obj.getPositionX())
                .positionY(obj.getPositionY())
                .optional(obj.getOptional())
                .requiredItems(obj.getRequiredItems().stream()
                        .map(QuestDetail::toRequiredItemDto)
                        .collect(Collectors.toList()))
                .build();
    }

    private static RequiredItemDto toRequiredItemDto(QuestObjectiveItem objItem) {
        Item item = objItem.getItem();
        return RequiredItemDto.builder()
                .item(ItemRef.builder()
                        .id(item.getId())
                        .name(item.getName())
                        .shortName(item.getShortName())
                        .iconUrl(item.getIconUrl())
                        .build())
                .count(objItem.getCount())
                .foundInRaid(objItem.getFoundInRaid())
                .build();
    }
}
