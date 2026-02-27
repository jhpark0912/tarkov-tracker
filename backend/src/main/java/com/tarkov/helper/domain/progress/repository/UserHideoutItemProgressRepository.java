package com.tarkov.helper.domain.progress.repository;

import com.tarkov.helper.domain.progress.entity.UserHideoutItemProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserHideoutItemProgressRepository extends JpaRepository<UserHideoutItemProgress, Long> {

    List<UserHideoutItemProgress> findAllByUserId(Long userId);

    Optional<UserHideoutItemProgress> findByUserIdAndRequirementId(Long userId, Long requirementId);

    void deleteAllByUserId(Long userId);

    @Modifying
    @Query("DELETE FROM UserHideoutItemProgress p WHERE p.requirement.id IN :requirementIds")
    void deleteAllByRequirementIdIn(@Param("requirementIds") List<Long> requirementIds);
}
