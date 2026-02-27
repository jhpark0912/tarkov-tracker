package com.tarkov.helper.domain.progress.dto;

import com.tarkov.helper.domain.progress.entity.UserHideoutProgress;

public record HideoutStationProgressResponse(
        String stationApiId,
        int currentLevel
) {
    public static HideoutStationProgressResponse from(UserHideoutProgress progress) {
        return new HideoutStationProgressResponse(
                progress.getStationApiId(),
                progress.getCurrentLevel()
        );
    }
}
