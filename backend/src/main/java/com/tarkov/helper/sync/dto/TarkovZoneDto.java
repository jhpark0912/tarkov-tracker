package com.tarkov.helper.sync.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TarkovZoneDto {
    private TarkovMapReferenceDto map;
    private TarkovMapDto.TarkovPositionDto position;
}
