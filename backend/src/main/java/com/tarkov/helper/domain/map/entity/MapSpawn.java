package com.tarkov.helper.domain.map.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "map_spawns")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MapSpawn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "map_id", nullable = false)
    private GameMap gameMap;

    @Column(name = "zone_name")
    private String zoneName;

    @Column(length = 100)
    private String sides;

    @Column(length = 200)
    private String categories;

    @Column(name = "floor_id", length = 50)
    private String floorId;

    @Column(name = "position_x")
    private Double positionX;

    @Column(name = "position_y")
    private Double positionY;
}
