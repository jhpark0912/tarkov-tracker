package com.tarkov.helper.domain.story.service;

import com.tarkov.helper.domain.auth.entity.User;
import com.tarkov.helper.domain.story.dto.*;
import com.tarkov.helper.domain.story.entity.ChapterStatus;
import com.tarkov.helper.domain.story.entity.UserStoryProgress;
import com.tarkov.helper.domain.story.repository.UserStoryProgressRepository;
import com.tarkov.helper.global.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StoryService {

    private final StoryDataLoader storyDataLoader;
    private final UserStoryProgressRepository progressRepository;

    /**
     * 스토리 챕터 + 엔딩 정적 데이터 조회
     */
    public StoryDataResponse getStoryData() {
        return new StoryDataResponse(
                storyDataLoader.getChapters(),
                storyDataLoader.getEndings()
        );
    }

    /**
     * 사용자 스토리 진행 상태 조회
     */
    @Transactional(readOnly = true)
    public StoryProgressResponse getUserProgress(Long userId) {
        Map<String, StoryProgressResponse.ChapterProgressDto> chapters =
                progressRepository.findAllByUserId(userId).stream()
                        .collect(Collectors.toMap(
                                UserStoryProgress::getChapterId,
                                StoryProgressResponse.ChapterProgressDto::from
                        ));

        return StoryProgressResponse.builder()
                .chapters(chapters)
                .build();
    }

    /**
     * 챕터 상태 + 선택지 업데이트
     */
    @Transactional
    public StoryProgressResponse.ChapterProgressDto updateChapterProgress(
            User user, String chapterId, ChapterStatus status, String choiceId) {

        if (!storyDataLoader.isValidChapterId(chapterId)) {
            throw new ResourceNotFoundException("존재하지 않는 챕터입니다: " + chapterId);
        }

        UserStoryProgress progress = progressRepository
                .findByUserIdAndChapterId(user.getId(), chapterId)
                .orElseGet(() -> UserStoryProgress.builder()
                        .user(user)
                        .chapterId(chapterId)
                        .build());

        progress.updateStatus(status);
        if (choiceId != null) {
            progress.recordChoice(choiceId);
        }

        return StoryProgressResponse.ChapterProgressDto.from(progressRepository.save(progress));
    }

    /**
     * 스토리 진행 초기화
     */
    @Transactional
    public void resetProgress(Long userId) {
        progressRepository.deleteAllByUserId(userId);
        log.debug("유저 {} 스토리 진행 상태 초기화 완료", userId);
    }
}
