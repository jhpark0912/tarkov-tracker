package com.tarkov.helper.domain.story.dto;

import com.tarkov.helper.domain.story.entity.ChapterStatus;
import com.tarkov.helper.domain.story.entity.UserStoryProgress;
import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Getter
@Builder
public class StoryProgressResponse {
    private Map<String, ChapterProgressDto> chapters;

    @Getter
    @Builder
    public static class ChapterProgressDto {
        private ChapterStatus status;
        private String choiceId;

        public static ChapterProgressDto from(UserStoryProgress progress) {
            return ChapterProgressDto.builder()
                    .status(progress.getStatus())
                    .choiceId(progress.getChoiceId())
                    .build();
        }
    }
}
