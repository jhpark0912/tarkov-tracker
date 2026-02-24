package com.tarkov.helper.domain.trader.dto;

import com.tarkov.helper.domain.trader.entity.Trader;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TraderInfo {
    private Long id;
    private String name;
    private String imageUrl;

    public static TraderInfo from(Trader trader) {
        if (trader == null) return null;
        return TraderInfo.builder()
                .id(trader.getId())
                .name(trader.getName())
                .imageUrl(trader.getImageUrl())
                .build();
    }
}
