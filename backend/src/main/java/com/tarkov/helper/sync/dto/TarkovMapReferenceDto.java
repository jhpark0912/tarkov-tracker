package com.tarkov.helper.sync.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TarkovMapReferenceDto {
    private String id;
    private String name;
    private String normalizedName;
}
