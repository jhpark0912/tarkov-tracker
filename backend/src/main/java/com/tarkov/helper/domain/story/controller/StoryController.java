package com.tarkov.helper.domain.story.controller;

import com.tarkov.helper.domain.auth.entity.User;
import com.tarkov.helper.domain.story.dto.StoryDataResponse;
import com.tarkov.helper.domain.story.dto.StoryProgressResponse;
import com.tarkov.helper.domain.story.dto.StoryProgressUpdateRequest;
import com.tarkov.helper.domain.story.service.StoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/story")
@RequiredArgsConstructor
public class StoryController {

    private final StoryService storyService;

    /**
     * 스토리 챕터 + 엔딩 정적 데이터 조회 (비인증 허용)
     * GET /api/v1/story/chapters
     */
    @GetMapping("/chapters")
    public ResponseEntity<StoryDataResponse> getStoryData() {
        return ResponseEntity.ok(storyService.getStoryData());
    }

    /**
     * 사용자 스토리 진행 상태 조회
     * GET /api/v1/story/progress
     */
    @GetMapping("/progress")
    public ResponseEntity<StoryProgressResponse> getUserProgress(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(storyService.getUserProgress(user.getId()));
    }

    /**
     * 챕터 상태 업데이트 (선택지 포함)
     * PUT /api/v1/story/progress/{chapterId}
     */
    @PutMapping("/progress/{chapterId}")
    public ResponseEntity<StoryProgressResponse.ChapterProgressDto> updateChapterProgress(
            @AuthenticationPrincipal User user,
            @PathVariable String chapterId,
            @Valid @RequestBody StoryProgressUpdateRequest request) {
        return ResponseEntity.ok(
                storyService.updateChapterProgress(user, chapterId, request.getStatus(), request.getChoiceId()));
    }

    /**
     * 스토리 진행 초기화
     * PUT /api/v1/story/progress/reset
     */
    @PutMapping("/progress/reset")
    public ResponseEntity<Void> resetProgress(@AuthenticationPrincipal User user) {
        storyService.resetProgress(user.getId());
        return ResponseEntity.noContent().build();
    }
}
