package com.tarkov.helper.domain.progress.dto;

import com.tarkov.helper.domain.progress.entity.UserQuestProgress.QuestStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class QuestProgressUpdateRequest {

    @NotNull
    private QuestStatus status;
}
