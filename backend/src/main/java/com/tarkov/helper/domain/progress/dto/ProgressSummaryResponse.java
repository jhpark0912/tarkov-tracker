package com.tarkov.helper.domain.progress.dto;

import java.util.List;

public record ProgressSummaryResponse(
        long totalQuests,
        long completedQuests,
        double totalProgressPercent,
        KappaStats kappaQuests,
        List<TraderStats> byTrader,
        List<MapStats> byMap
) {
    public record KappaStats(long total, long completed, double percent) {}

    public record TraderStats(String traderName, long total, long completed, double percent) {}

    public record MapStats(String mapName, long total, long completed, double percent) {}

    public static double calcPercent(long completed, long total) {
        if (total == 0) return 0.0;
        return Math.round((completed * 1000.0 / total)) / 10.0;
    }
}
