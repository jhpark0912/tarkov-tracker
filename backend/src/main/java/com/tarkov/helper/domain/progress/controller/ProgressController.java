package com.tarkov.helper.domain.progress.controller;

import com.tarkov.helper.domain.auth.entity.User;
import com.tarkov.helper.domain.progress.dto.*;
import com.tarkov.helper.domain.progress.entity.UserQuestProgress.QuestStatus;
import com.tarkov.helper.domain.progress.service.ProgressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;

    /**
     * 전체 진행 상태 조회
     * GET /api/v1/progress
     */
    @GetMapping
    public ResponseEntity<UserProgressResponse> getUserProgress(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(progressService.getUserProgress(user.getId()));
    }

    /**
     * 진행률 요약 (대시보드용)
     * GET /api/v1/progress/summary
     */
    @GetMapping("/summary")
    public ResponseEntity<ProgressSummaryResponse> getProgressSummary(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(progressService.getProgressSummary(user.getId()));
    }

    /**
     * 퀘스트 상태 변경
     * PUT /api/v1/progress/quest/{questId}
     */
    @PutMapping("/quest/{questId}")
    public ResponseEntity<QuestProgressResponse> updateQuestProgress(
            @AuthenticationPrincipal User user,
            @PathVariable Long questId,
            @Valid @RequestBody QuestProgressUpdateRequest request) {
        return ResponseEntity.ok(
                progressService.updateQuestProgress(user, questId, request.getStatus()));
    }

    /**
     * 아이템 수집 수량 변경
     * PUT /api/v1/progress/item/{objectiveId}
     */
    @PutMapping("/item/{objectiveId}")
    public ResponseEntity<ItemProgressResponse> updateItemProgress(
            @AuthenticationPrincipal User user,
            @PathVariable Long objectiveId,
            @Valid @RequestBody ItemProgressUpdateRequest request) {
        return ResponseEntity.ok(
                progressService.updateItemProgress(user, objectiveId, request.getCollectedCount()));
    }

    /**
     * 전체 진행 초기화 (와이프)
     * PUT /api/v1/progress/reset
     */
    @PutMapping("/reset")
    public ResponseEntity<Void> resetProgress(@AuthenticationPrincipal User user) {
        progressService.resetProgress(user.getId());
        return ResponseEntity.noContent().build();
    }
}
