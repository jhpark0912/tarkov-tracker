package com.tarkov.helper.domain.story.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class StoryChapterResponse {
    private String id;
    private String name;
    private String description;
    private List<String> maps;
    private String nextChapterId;
    private List<ChoiceDto> choices;
    private int column;
    private int row;

    @Getter
    @Builder
    public static class ChoiceDto {
        private String id;
        private String label;
        private String description;
        private String nextChapterId;
    }
}
