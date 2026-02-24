package com.tarkov.helper.sync.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TarkovItemDto {

    private String id;
    private String name;
    private String shortName;
    private String iconLink;
    private String wikiLink;
    private Integer width;
    private Integer height;
}
