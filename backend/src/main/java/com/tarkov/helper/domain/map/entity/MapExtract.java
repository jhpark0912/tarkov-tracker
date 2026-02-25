package com.tarkov.helper.domain.map.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "map_extracts", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"map_id", "api_id"})
})
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MapExtract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "map_id", nullable = false)
    private GameMap gameMap;

    @Column(name = "api_id", nullable = false, length = 100)
    private String apiId;

    @Column(nullable = false)
    private String name;

    @Column(length = 20)
    private String faction;

    @Column(name = "floor_id", length = 50)
    private String floorId;

    @Column(name = "position_x")
    private Double positionX;

    @Column(name = "position_y")
    private Double positionY;
}
