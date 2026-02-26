package com.tarkov.helper.domain.story.dto;

import java.util.List;

public record StoryDataResponse(
        List<StoryChapterResponse> chapters,
        List<StoryEndingResponse> endings
) {}
