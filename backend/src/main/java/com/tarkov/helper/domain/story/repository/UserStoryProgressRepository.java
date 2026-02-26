package com.tarkov.helper.domain.story.repository;

import com.tarkov.helper.domain.story.entity.UserStoryProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserStoryProgressRepository extends JpaRepository<UserStoryProgress, Long> {

    List<UserStoryProgress> findAllByUserId(Long userId);

    Optional<UserStoryProgress> findByUserIdAndChapterId(Long userId, String chapterId);

    void deleteAllByUserId(Long userId);
}
