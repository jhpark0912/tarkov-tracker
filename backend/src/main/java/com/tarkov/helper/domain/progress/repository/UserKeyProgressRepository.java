package com.tarkov.helper.domain.progress.repository;

import com.tarkov.helper.domain.progress.entity.UserKeyProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserKeyProgressRepository extends JpaRepository<UserKeyProgress, Long> {

    List<UserKeyProgress> findAllByUserId(Long userId);

    Optional<UserKeyProgress> findByUserIdAndItemApiId(Long userId, String itemApiId);

    void deleteAllByUserId(Long userId);
}
