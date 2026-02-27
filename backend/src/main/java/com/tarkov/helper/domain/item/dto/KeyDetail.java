package com.tarkov.helper.domain.item.dto;

import java.util.List;

public record KeyDetail(
        String apiId,
        String name,
        String shortName,
        String iconUrl,
        String wikiLink,
        List<KeyDoor> doors,
        List<KeyQuest> quests
) {
    public record KeyDoor(
            Long lockId,
            String lockType,
            Boolean needsPower,
            String mapName,
            String mapNormalizedName,
            String floorId,
            Double positionX,
            Double positionY
    ) {}

    public record KeyQuest(
            Long questId,
            String questName,
            String traderName
    ) {}
}
