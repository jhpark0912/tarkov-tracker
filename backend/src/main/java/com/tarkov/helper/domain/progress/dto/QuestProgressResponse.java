package com.tarkov.helper.domain.progress.dto;

import com.tarkov.helper.domain.progress.entity.UserQuestProgress;
import com.tarkov.helper.domain.progress.entity.UserQuestProgress.QuestStatus;

import java.time.LocalDateTime;

public record QuestProgressResponse(
        Long questId,
        String questName,
        QuestStatus status,
        LocalDateTime updatedAt
) {
    public static QuestProgressResponse from(UserQuestProgress p) {
        return new QuestProgressResponse(
                p.getQuest().getId(),
                p.getQuest().getName(),
                p.getStatus(),
                p.getUpdatedAt()
        );
    }
}
