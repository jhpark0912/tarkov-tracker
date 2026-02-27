package com.tarkov.helper.domain.item.dto;

import java.util.List;

public record KeyListItem(
        String apiId,
        String name,
        String shortName,
        String iconUrl,
        int doorCount,
        int questCount,
        List<String> mapNames
) {}
