package com.tarkov.helper.domain.story.entity;

import com.tarkov.helper.domain.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_story_progress",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "chapter_id"}))
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStoryProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "chapter_id", nullable = false, length = 50)
    private String chapterId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ChapterStatus status = ChapterStatus.LOCKED;

    @Column(name = "choice_id", length = 50)
    private String choiceId;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void updateStatus(ChapterStatus newStatus) {
        this.status = newStatus;
    }

    public void recordChoice(String choiceId) {
        this.choiceId = choiceId;
    }
}
