package com.tarkov.helper.domain.map.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "map_locks")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MapLock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "map_id", nullable = false)
    private GameMap gameMap;

    @Column(name = "lock_type", length = 50)
    private String lockType;

    @Column(name = "needs_power")
    private Boolean needsPower;

    @Column(name = "key_api_id", length = 100)
    private String keyApiId;

    @Column(name = "key_name")
    private String keyName;

    @Column(name = "key_short_name", length = 100)
    private String keyShortName;

    @Column(name = "key_icon_url")
    private String keyIconUrl;

    @Column(name = "floor_id", length = 50)
    private String floorId;

    @Column(name = "position_x")
    private Double positionX;

    @Column(name = "position_y")
    private Double positionY;
}
