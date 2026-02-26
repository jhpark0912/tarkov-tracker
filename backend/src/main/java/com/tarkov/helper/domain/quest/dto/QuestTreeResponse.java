package com.tarkov.helper.domain.quest.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class QuestTreeResponse {
    private List<TreeNode> nodes;
    private List<TreeEdge> edges;

    @Getter
    @Builder
    public static class TreeNode {
        private Long id;
        private String name;
        private String traderName;
        private String traderImageUrl;
        private String mapName;
        private Integer minPlayerLevel;
        private Boolean kappaRequired;
        private Boolean lightkeeperRequired;
    }

    @Getter
    @Builder
    public static class TreeEdge {
        private Long source; // 선행 퀘스트 ID
        private Long target; // 종속 퀘스트 ID
    }
}
