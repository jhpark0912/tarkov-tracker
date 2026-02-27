package com.tarkov.helper.domain.progress.entity;

import com.tarkov.helper.domain.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_hideout_progress",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "station_api_id"}))
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserHideoutProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "station_api_id", nullable = false, length = 100)
    private String stationApiId;

    @Column(name = "current_level", nullable = false)
    @Builder.Default
    private Integer currentLevel = 0;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void updateLevel(int level) {
        this.currentLevel = level;
    }
}
