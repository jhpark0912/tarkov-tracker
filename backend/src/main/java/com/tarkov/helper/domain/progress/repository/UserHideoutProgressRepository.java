package com.tarkov.helper.domain.progress.repository;

import com.tarkov.helper.domain.progress.entity.UserHideoutProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserHideoutProgressRepository extends JpaRepository<UserHideoutProgress, Long> {

    List<UserHideoutProgress> findAllByUserId(Long userId);

    Optional<UserHideoutProgress> findByUserIdAndStationApiId(Long userId, String stationApiId);

    void deleteAllByUserId(Long userId);
}
