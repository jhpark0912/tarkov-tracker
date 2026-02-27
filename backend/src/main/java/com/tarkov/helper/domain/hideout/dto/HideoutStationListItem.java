package com.tarkov.helper.domain.hideout.dto;

import com.tarkov.helper.domain.hideout.entity.HideoutStation;

public record HideoutStationListItem(
        String apiId,
        String name,
        String normalizedName,
        String imageLink,
        int maxLevel
) {
    public static HideoutStationListItem from(HideoutStation station) {
        int maxLevel = station.getLevels().stream()
                .mapToInt(l -> l.getLevel())
                .max()
                .orElse(0);
        return new HideoutStationListItem(
                station.getApiId(),
                station.getName(),
                station.getNormalizedName(),
                station.getImageLink(),
                maxLevel
        );
    }
}
