package com.tarkov.helper.domain.story.controller;

import com.tarkov.helper.domain.auth.entity.User;
import com.tarkov.helper.domain.story.dto.StoryProgressResponse;
import com.tarkov.helper.domain.story.dto.StoryProgressUpdateRequest;
import com.tarkov.helper.domain.story.service.StoryService;
import com.tarkov.helper.global.exception.UnauthorizedException;
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

    private User requireUser(User user) {
        if (user == null) throw new UnauthorizedException("인증이 필요합니다");
        return user;
    }

    @GetMapping("/progress")
    public ResponseEntity<StoryProgressResponse> getUserProgress(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(storyService.getUserProgress(requireUser(user).getId()));
    }

    @PutMapping("/progress/{chapterId}")
    public ResponseEntity<StoryProgressResponse.ChapterProgressDto> updateChapterProgress(
            @AuthenticationPrincipal User user,
            @PathVariable String chapterId,
            @Valid @RequestBody StoryProgressUpdateRequest request) {
        return ResponseEntity.ok(
                storyService.updateChapterProgress(requireUser(user), chapterId, request.getStatus(), request.getChoiceId()));
    }

    @PutMapping("/progress/reset")
    public ResponseEntity<Void> resetProgress(@AuthenticationPrincipal User user) {
        storyService.resetProgress(requireUser(user).getId());
        return ResponseEntity.noContent().build();
    }
}
