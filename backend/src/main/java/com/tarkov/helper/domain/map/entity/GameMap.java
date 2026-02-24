package com.tarkov.helper.domain.map.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "maps")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameMap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "api_id", nullable = false, unique = true, length = 100)
    private String apiId;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(name = "normalized_name", nullable = false, unique = true, length = 50)
    private String normalizedName;

    @Column(name = "svg_file", length = 100)
    private String svgFile;

    @Column(name = "default_floor", length = 50)
    private String defaultFloor;

    @Builder.Default
    @Column(name = "coordinate_rotation")
    private Integer coordinateRotation = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "gameMap", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MapFloor> floors = new ArrayList<>();

    public void update(String name) {
        this.name = name;
    }

    public void updateMetadata(String svgFile, String defaultFloor, Integer coordinateRotation) {
        this.svgFile = svgFile;
        this.defaultFloor = defaultFloor;
        this.coordinateRotation = coordinateRotation;
    }
}
