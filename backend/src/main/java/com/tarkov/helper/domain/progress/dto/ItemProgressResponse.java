package com.tarkov.helper.domain.progress.dto;

import com.tarkov.helper.domain.progress.entity.UserItemProgress;

import java.time.LocalDateTime;

public record ItemProgressResponse(
        Long objectiveId,
        Long questId,
        int collectedCount,
        LocalDateTime updatedAt
) {
    public static ItemProgressResponse from(UserItemProgress p) {
        return new ItemProgressResponse(
                p.getObjective().getId(),
                p.getObjective().getQuest().getId(),
                p.getCollectedCount(),
                p.getUpdatedAt()
        );
    }
}
