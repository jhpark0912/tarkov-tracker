package com.tarkov.helper.domain.quest.service;

import com.tarkov.helper.domain.map.repository.GameMapRepository;
import com.tarkov.helper.domain.quest.dto.QuestDetail;
import com.tarkov.helper.domain.quest.dto.QuestListItem;
import com.tarkov.helper.domain.quest.dto.QuestMapMarker;
import com.tarkov.helper.domain.quest.dto.QuestTreeResponse;
import com.tarkov.helper.domain.quest.entity.Quest;
import com.tarkov.helper.domain.quest.entity.QuestObjective;
import com.tarkov.helper.domain.quest.entity.QuestPrerequisite;
import com.tarkov.helper.domain.quest.repository.QuestObjectiveRepository;
import com.tarkov.helper.domain.quest.repository.QuestPrerequisiteRepository;
import com.tarkov.helper.domain.quest.repository.QuestRepository;
import com.tarkov.helper.domain.trader.repository.TraderRepository;
import com.tarkov.helper.global.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuestService {

    private final QuestRepository questRepository;
    private final QuestObjectiveRepository questObjectiveRepository;
    private final QuestPrerequisiteRepository questPrerequisiteRepository;
    private final TraderRepository traderRepository;
    private final GameMapRepository gameMapRepository;

    public List<QuestListItem> getQuestList(String traderName, Boolean kappaRequired,
                                             Boolean lightkeeperRequired, String mapNormalizedName) {
        Long traderId = null;
        if (traderName != null) {
            traderId = traderRepository.findAll().stream()
                    .filter(t -> t.getName().equalsIgnoreCase(traderName))
                    .map(t -> t.getId())
                    .findFirst()
                    .orElse(null);
        }

        Long mapId = null;
        if (mapNormalizedName != null) {
            mapId = gameMapRepository.findByNormalizedName(mapNormalizedName)
                    .map(m -> m.getId())
                    .orElse(null);
        }

        return questRepository.findWithFilters(traderId, kappaRequired, lightkeeperRequired, mapId).stream()
                .map(QuestListItem::from)
                .collect(Collectors.toList());
    }

    public QuestDetail getQuestDetail(Long id) {
        Quest quest = questRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("퀘스트를 찾을 수 없습니다: " + id));

        List<QuestObjective> objectives = questObjectiveRepository.findByQuestWithItems(quest);
        List<QuestPrerequisite> prerequisites = questPrerequisiteRepository.findByQuestWithPrereqs(quest);

        return QuestDetail.from(quest, objectives, prerequisites);
    }

    public List<QuestMapMarker> getMapMarkers(Long mapId, String floorId) {
        List<QuestObjective> objectives = questObjectiveRepository.findMapMarkersForMap(mapId);

        return objectives.stream()
                .filter(o -> floorId == null || floorId.equals(o.getFloorId()))
                .map(QuestMapMarker::from)
                .collect(Collectors.toList());
    }

    // ─── 퀘스트 트리 ──────────────────────────────────────────

    /**
     * 특정 퀘스트의 선행 트리 (BFS 역방향 탐색)
     */
    public QuestTreeResponse getQuestTree(Long questId) {
        Quest root = questRepository.findByIdWithDetails(questId)
                .orElseThrow(() -> new ResourceNotFoundException("퀘스트를 찾을 수 없습니다: " + questId));

        Set<Long> visited = new HashSet<>();
        List<QuestTreeResponse.TreeNode> nodes = new ArrayList<>();
        List<QuestTreeResponse.TreeEdge> edges = new ArrayList<>();
        Deque<Quest> queue = new ArrayDeque<>();

        queue.add(root);
        visited.add(root.getId());
        nodes.add(toTreeNode(root));

        int depth = 0;
        while (!queue.isEmpty() && depth < 20) {
            int size = queue.size();
            for (int i = 0; i < size; i++) {
                Quest current = queue.poll();
                List<QuestPrerequisite> prereqs = questPrerequisiteRepository.findByQuestWithPrereqs(current);
                for (QuestPrerequisite p : prereqs) {
                    Quest prereq = p.getPrereqQuest();
                    if (prereq == null || prereq.getRemoved()) continue;

                    edges.add(QuestTreeResponse.TreeEdge.builder()
                            .source(prereq.getId())
                            .target(current.getId())
                            .build());

                    if (!visited.contains(prereq.getId())) {
                        visited.add(prereq.getId());
                        nodes.add(toTreeNode(prereq));
                        queue.add(prereq);
                    }
                }
            }
            depth++;
        }

        return QuestTreeResponse.builder().nodes(nodes).edges(edges).build();
    }

    /**
     * 카파 퀘스트 전체 의존 그래프
     */
    public QuestTreeResponse getKappaTree() {
        return buildFilteredTree(true, null);
    }

    /**
     * 등대지기 퀘스트 전체 의존 그래프
     */
    public QuestTreeResponse getLightkeeperTree() {
        return buildFilteredTree(null, true);
    }

    private QuestTreeResponse buildFilteredTree(Boolean kappaRequired, Boolean lightkeeperRequired) {
        List<Quest> targetQuests = questRepository.findWithFilters(null, kappaRequired, lightkeeperRequired, null);
        Set<Long> targetIds = new HashSet<>();
        targetQuests.forEach(q -> targetIds.add(q.getId()));

        // 모든 선행조건 관계 한 번에 로드
        List<QuestPrerequisite> allPrereqs = questPrerequisiteRepository.findAllWithDetails();

        // 인접 리스트 생성 (quest → prereqs)
        Map<Long, List<Quest>> prereqMap = new HashMap<>();
        for (QuestPrerequisite p : allPrereqs) {
            prereqMap.computeIfAbsent(p.getQuest().getId(), k -> new ArrayList<>())
                    .add(p.getPrereqQuest());
        }

        Set<Long> visited = new HashSet<>();
        List<QuestTreeResponse.TreeNode> nodes = new ArrayList<>();
        List<QuestTreeResponse.TreeEdge> edges = new ArrayList<>();
        Deque<Quest> queue = new ArrayDeque<>();

        // 시드: 대상 퀘스트들
        for (Quest q : targetQuests) {
            if (!visited.contains(q.getId())) {
                visited.add(q.getId());
                nodes.add(toTreeNode(q));
                queue.add(q);
            }
        }

        // BFS 역방향 탐색
        int depth = 0;
        while (!queue.isEmpty() && depth < 20) {
            int size = queue.size();
            for (int i = 0; i < size; i++) {
                Quest current = queue.poll();
                List<Quest> prereqs = prereqMap.getOrDefault(current.getId(), List.of());
                for (Quest prereq : prereqs) {
                    edges.add(QuestTreeResponse.TreeEdge.builder()
                            .source(prereq.getId())
                            .target(current.getId())
                            .build());

                    if (!visited.contains(prereq.getId())) {
                        visited.add(prereq.getId());
                        nodes.add(toTreeNode(prereq));
                        queue.add(prereq);
                    }
                }
            }
            depth++;
        }

        return QuestTreeResponse.builder().nodes(nodes).edges(edges).build();
    }

    private QuestTreeResponse.TreeNode toTreeNode(Quest quest) {
        return QuestTreeResponse.TreeNode.builder()
                .id(quest.getId())
                .name(quest.getName())
                .traderName(quest.getTrader() != null ? quest.getTrader().getName() : null)
                .traderImageUrl(quest.getTrader() != null ? quest.getTrader().getImageUrl() : null)
                .mapName(quest.getMap() != null ? quest.getMap().getName() : null)
                .minPlayerLevel(quest.getMinPlayerLevel())
                .kappaRequired(quest.getKappaRequired())
                .lightkeeperRequired(quest.getLightkeeperRequired())
                .build();
    }
}
