package com.tarkov.helper.domain.progress.entity;

import com.tarkov.helper.domain.auth.entity.User;
import com.tarkov.helper.domain.quest.entity.QuestObjective;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_item_progress",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "objective_id"}))
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserItemProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "objective_id", nullable = false)
    private QuestObjective objective;

    @Column(name = "collected_count", nullable = false)
    @Builder.Default
    private int collectedCount = 0;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void updateCollectedCount(int count) {
        this.collectedCount = Math.max(0, count);
    }
}
