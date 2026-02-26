package com.tarkov.helper.sync.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TarkovTaskDto {

    private String id;
    private String name;
    private Boolean kappaRequired;
    private Boolean lightkeeperRequired;
    private Integer minPlayerLevel;
    private String wikiLink;
    private String taskImageLink;
    private Integer experience;
    private TarkovTraderDto trader;
    private TarkovMapReferenceDto map;
    private List<TarkovTaskRequirementDto> taskRequirements;
    private List<TarkovObjectiveDto> objectives;

    @Getter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TarkovTaskRequirementDto {
        private TarkovTaskRefDto task;
    }

    @Getter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TarkovTaskRefDto {
        private String id;
    }
}
