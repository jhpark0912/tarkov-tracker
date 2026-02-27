package com.tarkov.helper.domain.progress.service;

import com.tarkov.helper.domain.auth.entity.User;
import com.tarkov.helper.domain.hideout.entity.HideoutItemRequirement;
import com.tarkov.helper.domain.progress.dto.*;
import com.tarkov.helper.domain.progress.entity.UserHideoutItemProgress;
import com.tarkov.helper.domain.progress.entity.UserHideoutProgress;
import com.tarkov.helper.domain.progress.repository.UserHideoutItemProgressRepository;
import com.tarkov.helper.domain.progress.repository.UserHideoutProgressRepository;
import com.tarkov.helper.global.exception.ResourceNotFoundException;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HideoutProgressService {

    private final UserHideoutProgressRepository hideoutProgressRepo;
    private final UserHideoutItemProgressRepository hideoutItemProgressRepo;
    private final EntityManager entityManager;

    @Transactional(readOnly = true)
    public HideoutProgressResponse getUserHideoutProgress(Long userId) {
        Map<String, Integer> stationLevels = hideoutProgressRepo.findAllByUserId(userId).stream()
                .collect(Collectors.toMap(
                        UserHideoutProgress::getStationApiId,
                        UserHideoutProgress::getCurrentLevel
                ));

        Map<Long, Integer> itemCounts = hideoutItemProgressRepo.findAllByUserId(userId).stream()
                .collect(Collectors.toMap(
                        p -> p.getRequirement().getId(),
                        UserHideoutItemProgress::getCollectedCount
                ));

        return new HideoutProgressResponse(stationLevels, itemCounts);
    }

    @Transactional
    public HideoutStationProgressResponse updateStationLevel(User user, String stationApiId, int level) {
        UserHideoutProgress progress = hideoutProgressRepo
                .findByUserIdAndStationApiId(user.getId(), stationApiId)
                .orElseGet(() -> UserHideoutProgress.builder()
                        .user(user)
                        .stationApiId(stationApiId)
                        .build());

        progress.updateLevel(level);
        return HideoutStationProgressResponse.from(hideoutProgressRepo.save(progress));
    }

    @Transactional
    public HideoutItemProgressResponse updateItemProgress(User user, Long requirementId, int collectedCount) {
        UserHideoutItemProgress progress = hideoutItemProgressRepo
                .findByUserIdAndRequirementId(user.getId(), requirementId)
                .orElseGet(() -> {
                    HideoutItemRequirement req = entityManager.getReference(HideoutItemRequirement.class, requirementId);
                    return UserHideoutItemProgress.builder()
                            .user(user)
                            .requirement(req)
                            .build();
                });

        progress.updateCollectedCount(collectedCount);
        return HideoutItemProgressResponse.from(hideoutItemProgressRepo.save(progress));
    }
}
