package com.tarkov.helper.domain.progress.service;

import com.tarkov.helper.domain.auth.entity.User;
import com.tarkov.helper.domain.progress.dto.KeyProgressResponse;
import com.tarkov.helper.domain.progress.entity.UserKeyProgress;
import com.tarkov.helper.domain.progress.repository.UserKeyProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class KeyProgressService {

    private final UserKeyProgressRepository keyProgressRepo;

    @Transactional(readOnly = true)
    public List<KeyProgressResponse> getUserKeyProgress(Long userId) {
        return keyProgressRepo.findAllByUserId(userId).stream()
                .map(KeyProgressResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public KeyProgressResponse updateKeyProgress(User user, String itemApiId, boolean owned) {
        UserKeyProgress progress = keyProgressRepo
                .findByUserIdAndItemApiId(user.getId(), itemApiId)
                .orElseGet(() -> UserKeyProgress.builder()
                        .user(user)
                        .itemApiId(itemApiId)
                        .build());

        progress.updateOwned(owned);
        return KeyProgressResponse.from(keyProgressRepo.save(progress));
    }
}
