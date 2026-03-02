package com.tarkov.helper.domain.item.dto;

import java.util.List;

public record KeyListItem(
        String apiId,
        String name,
        String shortName,
        String iconUrl,
        Integer price,
        int doorCount,
        int questCount,
        List<String> mapNames
) {}
