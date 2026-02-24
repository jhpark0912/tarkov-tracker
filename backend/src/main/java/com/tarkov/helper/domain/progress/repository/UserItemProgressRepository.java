package com.tarkov.helper.domain.progress.repository;

import com.tarkov.helper.domain.progress.entity.UserItemProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserItemProgressRepository extends JpaRepository<UserItemProgress, Long> {

    Optional<UserItemProgress> findByUserIdAndObjectiveId(Long userId, Long objectiveId);

    @Query("SELECT uip FROM UserItemProgress uip " +
            "JOIN FETCH uip.objective o " +
            "JOIN FETCH o.quest q " +
            "WHERE uip.user.id = :userId AND q.removed = false")
    List<UserItemProgress> findAllByUserId(@Param("userId") Long userId);

    void deleteAllByUserId(Long userId);
}
