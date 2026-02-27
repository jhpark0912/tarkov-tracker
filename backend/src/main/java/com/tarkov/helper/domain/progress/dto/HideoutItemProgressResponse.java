package com.tarkov.helper.domain.progress.dto;

import com.tarkov.helper.domain.progress.entity.UserHideoutItemProgress;

public record HideoutItemProgressResponse(
        Long requirementId,
        int collectedCount
) {
    public static HideoutItemProgressResponse from(UserHideoutItemProgress progress) {
        return new HideoutItemProgressResponse(
                progress.getRequirement().getId(),
                progress.getCollectedCount()
        );
    }
}
