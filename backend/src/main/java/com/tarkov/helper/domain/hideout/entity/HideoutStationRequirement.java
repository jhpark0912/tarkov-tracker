package com.tarkov.helper.domain.hideout.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hideout_station_requirements")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HideoutStationRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hideout_level_id", nullable = false)
    private HideoutLevel hideoutLevel;

    @Column(name = "required_station_api_id", nullable = false, length = 100)
    private String requiredStationApiId;

    @Column(name = "required_station_name")
    private String requiredStationName;

    @Column(name = "required_level", nullable = false)
    private Integer requiredLevel;
}
