package com.tarkov.helper.domain.progress.entity;

import com.tarkov.helper.domain.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_key_progress",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "item_api_id"}))
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserKeyProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "item_api_id", nullable = false, length = 100)
    private String itemApiId;

    @Column(nullable = false)
    @Builder.Default
    private Boolean owned = false;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void updateOwned(boolean owned) {
        this.owned = owned;
    }
}
