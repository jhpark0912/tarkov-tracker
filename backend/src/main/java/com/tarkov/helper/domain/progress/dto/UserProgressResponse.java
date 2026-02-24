package com.tarkov.helper.domain.progress.dto;

import com.tarkov.helper.domain.progress.entity.UserQuestProgress.QuestStatus;

import java.util.List;
import java.util.Map;

public record UserProgressResponse(
        Map<Long, QuestStatus> questStatuses,       // questId → status
        Map<Long, Integer> itemCollectedCounts      // objectiveId → collectedCount
) {}
