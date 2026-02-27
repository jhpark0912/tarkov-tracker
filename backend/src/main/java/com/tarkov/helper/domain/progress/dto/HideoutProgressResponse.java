package com.tarkov.helper.domain.progress.dto;

import java.util.List;
import java.util.Map;

public record HideoutProgressResponse(
        Map<String, Integer> stationLevels,
        Map<Long, Integer> itemCollectedCounts
) {}
