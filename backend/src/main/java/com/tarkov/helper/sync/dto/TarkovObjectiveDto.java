package com.tarkov.helper.sync.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * tarkov.dev GraphQL inline fragment 결과를 플랫하게 수신.
 * TaskObjectiveItem / TaskObjectiveMark 필드는 해당 타입이 아니면 null.
 */
@Getter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TarkovObjectiveDto {

    private String id;
    private String type;
    private String description;
    private Boolean optional;
    private List<TarkovMapReferenceDto> maps;
    private List<TarkovZoneDto> zones;

    // TaskObjectiveItem 필드
    private TarkovItemDto item;
    private List<TarkovItemDto> items;
    private Integer count;
    private Boolean foundInRaid;

    // TaskObjectiveMark 필드
    private TarkovItemDto markerItem;
}
