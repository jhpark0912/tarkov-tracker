package com.tarkov.helper.sync.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TarkovMapDto {
    private String id;
    private String name;
    private String normalizedName;
    private List<TarkovExtractDto> extracts;
    private List<TarkovLockDto> locks;
    private List<TarkovBossDto> bosses;
    private List<TarkovLootContainerDto> lootContainers;

    @Getter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TarkovExtractDto {
        private String id;
        private String name;
        private String faction;
        private TarkovPositionDto position;
        private Double top;
        private Double bottom;
    }

    @Getter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TarkovLockDto {
        private String lockType;
        private Boolean needsPower;
        private TarkovKeyDto key;
        private TarkovPositionDto position;
        private Double top;
        private Double bottom;
    }

    @Getter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TarkovBossDto {
        private String name;
        private Double spawnChance;
        private List<TarkovBossSpawnDto> spawnLocations;
    }

    @Getter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TarkovBossSpawnDto {
        private String name;
        private Double chance;
    }

    @Getter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TarkovPositionDto {
        private Double x;
        private Double y;
        private Double z;
    }

    @Getter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TarkovKeyDto {
        private String id;
        private String name;
        private String shortName;
        private String iconLink;
        private Integer avg24hPrice;
    }

    @Getter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TarkovLootContainerDto {
        private TarkovPositionDto position;
        private TarkovContainerInfoDto lootContainer;
    }

    @Getter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TarkovContainerInfoDto {
        private String name;
        private String normalizedName;
    }
}
