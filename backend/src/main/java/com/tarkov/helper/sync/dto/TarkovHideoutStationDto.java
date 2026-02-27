package com.tarkov.helper.sync.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TarkovHideoutStationDto {
    private String id;
    private String name;
    private String normalizedName;
    private String imageLink;
    private List<TarkovHideoutLevelDto> levels;
}
