package com.tarkov.helper.domain.marker.entity;

import com.tarkov.helper.domain.auth.entity.User;
import com.tarkov.helper.domain.map.entity.GameMap;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_map_markers", indexes = {
        @Index(name = "idx_user_map_markers_user_map", columnList = "user_id, map_id")
})
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserMapMarker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "map_id", nullable = false)
    private GameMap map;

    @Column(name = "floor_id", length = 50)
    private String floorId;

    @Column(name = "position_x", nullable = false)
    private Double positionX;

    @Column(name = "position_y", nullable = false)
    private Double positionY;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "marker_type", nullable = false, length = 20)
    private MarkerType markerType;

    @Column(length = 7)
    private String color;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void update(String title, String description, MarkerType markerType, String color) {
        if (title != null) this.title = title;
        this.description = description;  // null = 클리어 허용
        if (markerType != null) this.markerType = markerType;
        this.color = color;              // null = 클리어 허용
    }
}
