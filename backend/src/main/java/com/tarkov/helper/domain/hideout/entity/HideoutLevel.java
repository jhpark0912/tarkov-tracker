package com.tarkov.helper.domain.hideout.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.BatchSize;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "hideout_levels",
        uniqueConstraints = @UniqueConstraint(columnNames = {"station_id", "level"}))
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HideoutLevel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "station_id", nullable = false)
    private HideoutStation station;

    @Column(nullable = false)
    private Integer level;

    @Column(name = "construction_time")
    private Integer constructionTime;

    @Column(length = 1000)
    private String description;

    @OneToMany(mappedBy = "hideoutLevel", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 30)
    @Builder.Default
    private List<HideoutItemRequirement> itemRequirements = new ArrayList<>();

    @OneToMany(mappedBy = "hideoutLevel", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 30)
    @Builder.Default
    private List<HideoutStationRequirement> stationRequirements = new ArrayList<>();

    @OneToMany(mappedBy = "hideoutLevel", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 30)
    @Builder.Default
    private List<HideoutSkillRequirement> skillRequirements = new ArrayList<>();

    @OneToMany(mappedBy = "hideoutLevel", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 30)
    @Builder.Default
    private List<HideoutTraderRequirement> traderRequirements = new ArrayList<>();

    public void update(Integer constructionTime, String description) {
        this.constructionTime = constructionTime;
        this.description = description;
    }

    public void clearRequirements() {
        this.itemRequirements.clear();
        this.stationRequirements.clear();
        this.skillRequirements.clear();
        this.traderRequirements.clear();
    }
}
