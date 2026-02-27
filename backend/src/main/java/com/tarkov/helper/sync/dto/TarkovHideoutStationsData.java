package com.tarkov.helper.sync.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TarkovHideoutStationsData {
    private List<TarkovHideoutStationDto> hideoutStations;
}
