package com.tarkov.helper.domain.progress.service;

import com.tarkov.helper.domain.auth.entity.User;
import com.tarkov.helper.domain.progress.dto.*;
import com.tarkov.helper.domain.progress.entity.UserItemProgress;
import com.tarkov.helper.domain.progress.entity.UserQuestProgress;
import com.tarkov.helper.domain.progress.entity.UserQuestProgress.QuestStatus;
import com.tarkov.helper.domain.progress.repository.UserItemProgressRepository;
import com.tarkov.helper.domain.progress.repository.UserQuestProgressRepository;
import com.tarkov.helper.domain.quest.entity.Quest;
import com.tarkov.helper.domain.quest.entity.QuestObjective;
import com.tarkov.helper.domain.quest.repository.QuestObjectiveRepository;
import com.tarkov.helper.domain.quest.repository.QuestRepository;
import com.tarkov.helper.global.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProgressService {

    private final UserQuestProgressRepository questProgressRepo;
    private final UserItemProgressRepository itemProgressRepo;
    private final QuestRepository questRepository;
    private final QuestObjectiveRepository objectiveRepository;

    /**
     * 전체 진행 상태 조회 (퀘스트 상태 맵 + 아이템 수집 수량 맵)
     */
    @Transactional(readOnly = true)
    public UserProgressResponse getUserProgress(Long userId) {
        Map<Long, QuestStatus> questStatuses = questProgressRepo.findAllByUserId(userId)
                .stream()
                .collect(Collectors.toMap(p -> p.getQuest().getId(), UserQuestProgress::getStatus));

        Map<Long, Integer> itemCounts = itemProgressRepo.findAllByUserId(userId)
                .stream()
                .collect(Collectors.toMap(p -> p.getObjective().getId(), UserItemProgress::getCollectedCount));

        return new UserProgressResponse(questStatuses, itemCounts);
    }

    /**
     * 진행 요약 (대시보드용)
     */
    @Transactional(readOnly = true)
    public ProgressSummaryResponse getProgressSummary(Long userId) {
        List<Quest> allQuests = questRepository.findByRemovedFalse();
        Set<Long> completedQuestIds = questProgressRepo.findAllByUserId(userId).stream()
                .filter(p -> p.getStatus() == QuestStatus.COMPLETED)
                .map(p -> p.getQuest().getId())
                .collect(Collectors.toSet());

        long totalQuests = allQuests.size();
        long completedQuests = allQuests.stream()
                .filter(q -> completedQuestIds.contains(q.getId()))
                .count();

        long totalKappa = allQuests.stream().filter(q -> Boolean.TRUE.equals(q.getKappaRequired())).count();
        long completedKappa = allQuests.stream()
                .filter(q -> Boolean.TRUE.equals(q.getKappaRequired()) && completedQuestIds.contains(q.getId()))
                .count();

        // 트레이더별 통계
        Map<String, long[]> byTraderMap = new LinkedHashMap<>();
        for (Quest q : allQuests) {
            if (q.getTrader() == null) continue;
            String traderName = q.getTrader().getName();
            byTraderMap.computeIfAbsent(traderName, k -> new long[]{0, 0});
            byTraderMap.get(traderName)[0]++;
            if (completedQuestIds.contains(q.getId())) byTraderMap.get(traderName)[1]++;
        }
        List<ProgressSummaryResponse.TraderStats> byTrader = byTraderMap.entrySet().stream()
                .map(e -> new ProgressSummaryResponse.TraderStats(
                        e.getKey(), e.getValue()[0], e.getValue()[1],
                        ProgressSummaryResponse.calcPercent(e.getValue()[1], e.getValue()[0])))
                .sorted(Comparator.comparing(ProgressSummaryResponse.TraderStats::traderName))
                .toList();

        // 맵별 통계 (맵 없는 퀘스트 제외)
        Map<String, long[]> byMapMap = new LinkedHashMap<>();
        for (Quest q : allQuests) {
            if (q.getMap() == null) continue;
            String mapName = q.getMap().getName();
            byMapMap.computeIfAbsent(mapName, k -> new long[]{0, 0});
            byMapMap.get(mapName)[0]++;
            if (completedQuestIds.contains(q.getId())) byMapMap.get(mapName)[1]++;
        }
        List<ProgressSummaryResponse.MapStats> byMap = byMapMap.entrySet().stream()
                .map(e -> new ProgressSummaryResponse.MapStats(
                        e.getKey(), e.getValue()[0], e.getValue()[1],
                        ProgressSummaryResponse.calcPercent(e.getValue()[1], e.getValue()[0])))
                .sorted(Comparator.comparing(ProgressSummaryResponse.MapStats::mapName))
                .toList();

        return new ProgressSummaryResponse(
                totalQuests,
                completedQuests,
                ProgressSummaryResponse.calcPercent(completedQuests, totalQuests),
                new ProgressSummaryResponse.KappaStats(
                        totalKappa, completedKappa,
                        ProgressSummaryResponse.calcPercent(completedKappa, totalKappa)),
                byTrader,
                byMap
        );
    }

    /**
     * 퀘스트 진행 상태 변경 (없으면 생성)
     */
    @Transactional
    public QuestProgressResponse updateQuestProgress(User user, Long questId, QuestStatus newStatus) {
        Quest quest = questRepository.findByIdWithDetails(questId)
                .orElseThrow(() -> new ResourceNotFoundException("퀘스트를 찾을 수 없습니다: " + questId));

        UserQuestProgress progress = questProgressRepo
                .findByUserIdAndQuestId(user.getId(), questId)
                .orElseGet(() -> UserQuestProgress.builder()
                        .user(user)
                        .quest(quest)
                        .build());

        progress.updateStatus(newStatus);
        return QuestProgressResponse.from(questProgressRepo.save(progress));
    }

    /**
     * 아이템 수집 수량 변경 (없으면 생성)
     */
    @Transactional
    public ItemProgressResponse updateItemProgress(User user, Long objectiveId, int count) {
        QuestObjective objective = objectiveRepository.findById(objectiveId)
                .orElseThrow(() -> new ResourceNotFoundException("퀘스트 목표를 찾을 수 없습니다: " + objectiveId));

        UserItemProgress progress = itemProgressRepo
                .findByUserIdAndObjectiveId(user.getId(), objectiveId)
                .orElseGet(() -> UserItemProgress.builder()
                        .user(user)
                        .objective(objective)
                        .build());

        progress.updateCollectedCount(count);
        return ItemProgressResponse.from(itemProgressRepo.save(progress));
    }

    /**
     * 전체 진행 초기화 (와이프)
     */
    @Transactional
    public void resetProgress(Long userId) {
        itemProgressRepo.deleteAllByUserId(userId);
        questProgressRepo.deleteAllByUserId(userId);
        log.info("유저 {} 진행 상태 초기화 완료", userId);
    }
}
