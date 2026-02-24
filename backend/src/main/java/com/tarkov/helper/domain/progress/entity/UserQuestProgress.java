package com.tarkov.helper.domain.progress.entity;

import com.tarkov.helper.domain.auth.entity.User;
import com.tarkov.helper.domain.quest.entity.Quest;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_quest_progress",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "quest_id"}))
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserQuestProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quest_id", nullable = false)
    private Quest quest;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private QuestStatus status = QuestStatus.NOT_STARTED;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void updateStatus(QuestStatus newStatus) {
        this.status = newStatus;
    }

    public enum QuestStatus {
        NOT_STARTED, IN_PROGRESS, COMPLETED
    }
}
