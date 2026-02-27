package com.tarkov.helper.sync.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SyncResult {
    private final int tradersProcessed;
    private final int mapsProcessed;
    private final int itemsProcessed;
    private final int questsAdded;
    private final int questsUpdated;
    private final int questsRemoved;
    private final int extractsProcessed;
    private final int locksProcessed;
    private final int containersProcessed;
    private final int hideoutStationsProcessed;
    private final long durationMs;

    @Override
    public String toString() {
        return String.format(
                "동기화 완료 - 딜러: %d, 맵: %d, 아이템: %d, 퀘스트 추가: %d / 갱신: %d / 제거: %d, 탈출구: %d, 잠금: %d, 컨테이너: %d, 은신처: %d (%dms)",
                tradersProcessed, mapsProcessed, itemsProcessed,
                questsAdded, questsUpdated, questsRemoved,
                extractsProcessed, locksProcessed, containersProcessed,
                hideoutStationsProcessed, durationMs
        );
    }
}
