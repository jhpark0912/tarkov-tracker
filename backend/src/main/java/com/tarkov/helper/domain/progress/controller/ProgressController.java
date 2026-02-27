package com.tarkov.helper.domain.progress.controller;

import com.tarkov.helper.domain.auth.entity.User;
import com.tarkov.helper.domain.progress.dto.*;
import com.tarkov.helper.domain.progress.entity.UserQuestProgress.QuestStatus;
import com.tarkov.helper.domain.progress.service.ProgressService;
import com.tarkov.helper.global.exception.UnauthorizedException;
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

    private User requireUser(User user) {
        if (user == null) throw new UnauthorizedException("인증이 필요합니다");
        return user;
    }

    @GetMapping
    public ResponseEntity<UserProgressResponse> getUserProgress(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(progressService.getUserProgress(requireUser(user).getId()));
    }

    @GetMapping("/summary")
    public ResponseEntity<ProgressSummaryResponse> getProgressSummary(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(progressService.getProgressSummary(requireUser(user).getId()));
    }

    @PutMapping("/quest/{questId}")
    public ResponseEntity<QuestProgressResponse> updateQuestProgress(
            @AuthenticationPrincipal User user,
            @PathVariable Long questId,
            @Valid @RequestBody QuestProgressUpdateRequest request) {
        return ResponseEntity.ok(
                progressService.updateQuestProgress(requireUser(user), questId, request.getStatus()));
    }

    @PutMapping("/item/{objectiveId}")
    public ResponseEntity<ItemProgressResponse> updateItemProgress(
            @AuthenticationPrincipal User user,
            @PathVariable Long objectiveId,
            @Valid @RequestBody ItemProgressUpdateRequest request) {
        return ResponseEntity.ok(
                progressService.updateItemProgress(requireUser(user), objectiveId, request.getCollectedCount()));
    }

    @PutMapping("/reset")
    public ResponseEntity<Void> resetProgress(@AuthenticationPrincipal User user) {
        progressService.resetProgress(requireUser(user).getId());
        return ResponseEntity.noContent().build();
    }
}
