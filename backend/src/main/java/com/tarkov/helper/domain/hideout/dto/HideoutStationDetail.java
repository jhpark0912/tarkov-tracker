package com.tarkov.helper.domain.hideout.dto;

import com.tarkov.helper.domain.hideout.entity.*;

import java.util.List;
import java.util.stream.Collectors;

public record HideoutStationDetail(
        String apiId,
        String name,
        String normalizedName,
        String imageLink,
        List<LevelDetail> levels
) {
    public record LevelDetail(
            Long id,
            int level,
            Integer constructionTime,
            String description,
            List<ItemReq> itemRequirements,
            List<StationReq> stationRequirements,
            List<SkillReq> skillRequirements,
            List<TraderReq> traderRequirements
    ) {}

    public record ItemReq(Long requirementId, String itemApiId, String itemName,
                           String itemShortName, String itemIconUrl, int count) {}

    public record StationReq(String stationApiId, String stationName, int requiredLevel) {}

    public record SkillReq(String skillName, int skillLevel) {}

    public record TraderReq(String traderApiId, String traderName, int loyaltyLevel) {}

    public static HideoutStationDetail from(HideoutStation station, List<HideoutLevel> levels) {
        List<LevelDetail> levelDetails = levels.stream()
                .map(l -> new LevelDetail(
                        l.getId(),
                        l.getLevel(),
                        l.getConstructionTime(),
                        l.getDescription(),
                        l.getItemRequirements().stream()
                                .map(ir -> new ItemReq(
                                        ir.getId(),
                                        ir.getItem().getApiId(),
                                        ir.getItem().getName(),
                                        ir.getItem().getShortName(),
                                        ir.getItem().getIconUrl(),
                                        ir.getCount()))
                                .collect(Collectors.toList()),
                        l.getStationRequirements().stream()
                                .map(sr -> new StationReq(
                                        sr.getRequiredStationApiId(),
                                        sr.getRequiredStationName(),
                                        sr.getRequiredLevel()))
                                .collect(Collectors.toList()),
                        l.getSkillRequirements().stream()
                                .map(sk -> new SkillReq(sk.getSkillName(), sk.getSkillLevel()))
                                .collect(Collectors.toList()),
                        l.getTraderRequirements().stream()
                                .map(tr -> new TraderReq(
                                        tr.getTraderApiId(),
                                        tr.getTraderName(),
                                        tr.getLoyaltyLevel()))
                                .collect(Collectors.toList())
                ))
                .collect(Collectors.toList());

        return new HideoutStationDetail(
                station.getApiId(), station.getName(),
                station.getNormalizedName(), station.getImageLink(),
                levelDetails
        );
    }
}
