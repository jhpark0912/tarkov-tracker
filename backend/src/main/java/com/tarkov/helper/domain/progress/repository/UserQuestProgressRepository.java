package com.tarkov.helper.domain.progress.repository;

import com.tarkov.helper.domain.progress.entity.UserQuestProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserQuestProgressRepository extends JpaRepository<UserQuestProgress, Long> {

    Optional<UserQuestProgress> findByUserIdAndQuestId(Long userId, Long questId);

    @Query("SELECT uqp FROM UserQuestProgress uqp " +
            "JOIN FETCH uqp.quest q " +
            "LEFT JOIN FETCH q.trader " +
            "LEFT JOIN FETCH q.map " +
            "WHERE uqp.user.id = :userId AND q.removed = false")
    List<UserQuestProgress> findAllByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(uqp) FROM UserQuestProgress uqp " +
            "JOIN uqp.quest q " +
            "WHERE uqp.user.id = :userId AND uqp.status = 'COMPLETED' AND q.removed = false")
    long countCompletedByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(uqp) FROM UserQuestProgress uqp " +
            "JOIN uqp.quest q " +
            "WHERE uqp.user.id = :userId AND uqp.status = 'COMPLETED' " +
            "AND q.kappaRequired = true AND q.removed = false")
    long countKappaCompletedByUserId(@Param("userId") Long userId);

    void deleteAllByUserId(Long userId);
}
