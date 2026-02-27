package com.tarkov.helper.domain.progress.entity;

import com.tarkov.helper.domain.auth.entity.User;
import com.tarkov.helper.domain.hideout.entity.HideoutItemRequirement;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_hideout_item_progress",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "requirement_id"}))
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserHideoutItemProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requirement_id", nullable = false)
    private HideoutItemRequirement requirement;

    @Column(name = "collected_count", nullable = false)
    @Builder.Default
    private Integer collectedCount = 0;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void updateCollectedCount(int count) {
        this.collectedCount = Math.max(0, count);
    }
}
