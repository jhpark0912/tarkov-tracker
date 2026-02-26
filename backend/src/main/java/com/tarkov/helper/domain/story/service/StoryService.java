package com.tarkov.helper.domain.story.service;

import com.tarkov.helper.domain.auth.entity.User;
import com.tarkov.helper.domain.story.dto.StoryProgressResponse;
import com.tarkov.helper.domain.story.dto.StoryProgressUpdateRequest;
import com.tarkov.helper.domain.story.entity.ChapterStatus;
import com.tarkov.helper.domain.story.entity.UserStoryProgress;
import com.tarkov.helper.domain.story.repository.UserStoryProgressRepository;
import com.tarkov.helper.global.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StoryService {

    /** 기존 챕터 ID (하위 호환) */
    private static final Set<String> VALID_CHAPTER_IDS = Set.of(
            "tour", "falling_skies", "the_ticket",
            "they_are_already_here", "batya", "blue_fire",
            "the_labyrinth", "accidental_witness", "the_unheard"
    );

    /** 새 노드 ID 패턴 (tour_01, fs_02, ...) */
    private static final java.util.regex.Pattern NODE_ID_PATTERN =
            java.util.regex.Pattern.compile("^(tour|fs|tt|ta|bt|bf|lb|aw|tu|ending)_\\w+$");

    private final UserStoryProgressRepository progressRepository;

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

        if (!VALID_CHAPTER_IDS.contains(chapterId) && !NODE_ID_PATTERN.matcher(chapterId).matches()) {
            throw new ResourceNotFoundException("존재하지 않는 챕터/노드입니다: " + chapterId);
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
