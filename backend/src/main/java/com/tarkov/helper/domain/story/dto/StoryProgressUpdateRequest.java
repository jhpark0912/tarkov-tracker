package com.tarkov.helper.domain.story.dto;

import com.tarkov.helper.domain.story.entity.ChapterStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class StoryProgressUpdateRequest {

    @NotNull
    private ChapterStatus status;

    private String choiceId;
}
