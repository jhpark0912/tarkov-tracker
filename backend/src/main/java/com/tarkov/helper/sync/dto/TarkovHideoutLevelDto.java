package com.tarkov.helper.sync.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TarkovHideoutLevelDto {
    private Integer level;
    private Integer constructionTime;
    private String description;
    private List<ItemRequirement> itemRequirements;
    private List<StationRequirement> stationLevelRequirements;
    private List<SkillRequirement> skillRequirements;
    private List<TraderRequirement> traderRequirements;

    @Getter
    @Setter
    public static class ItemRequirement {
        private TarkovItemDto item;
        private Integer count;
    }

    @Getter
    @Setter
    public static class StationRequirement {
        private StationRef station;
        private Integer level;

        @Getter
        @Setter
        public static class StationRef {
            private String id;
            private String name;
        }
    }

    @Getter
    @Setter
    public static class SkillRequirement {
        private String name;
        private Integer level;
    }

    @Getter
    @Setter
    public static class TraderRequirement {
        private TraderRef trader;
        private Integer level;

        @Getter
        @Setter
        public static class TraderRef {
            private String id;
            private String name;
        }
    }
}
