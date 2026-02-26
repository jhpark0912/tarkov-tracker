package com.tarkov.helper.domain.story.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StoryEndingResponse {
    private String id;
    private String name;
    private String subtitle;
    private String description;
    private String color;
    private int column;
    private int row;
}
