package com.tarkov.helper.domain.map.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "map_floors", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"map_id", "floor_id"})
})
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MapFloor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "map_id", nullable = false)
    private GameMap gameMap;

    @Column(name = "floor_id", nullable = false, length = 50)
    private String floorId;

    @Column(name = "floor_label", nullable = false, length = 50)
    private String floorLabel;

    @Builder.Default
    @Column(name = "floor_order")
    private Integer floorOrder = 0;

    @Column(name = "floor_image", length = 100)
    private String floorImage;
}
