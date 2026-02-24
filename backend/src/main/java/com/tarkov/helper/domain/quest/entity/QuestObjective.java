package com.tarkov.helper.domain.quest.entity;

import com.tarkov.helper.domain.map.entity.GameMap;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quest_objectives")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestObjective {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quest_id", nullable = false)
    private Quest quest;

    @Column(name = "api_id", nullable = false, unique = true, length = 100)
    private String apiId;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(nullable = false, length = 500)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "map_id")
    private GameMap map;

    @Column(name = "floor_id", length = 50)
    private String floorId;

    @Column(name = "position_x")
    private Double positionX;

    @Column(name = "position_y")
    private Double positionY;

    @Builder.Default
    private Boolean optional = false;

    @OneToMany(mappedBy = "objective", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<QuestObjectiveItem> requiredItems = new ArrayList<>();

    public void update(String type, String description, GameMap map, Boolean optional) {
        this.type = type;
        this.description = description;
        this.map = map;
        this.optional = optional;
    }

    public void clearRequiredItems() {
        this.requiredItems.clear();
    }

    public void addRequiredItem(QuestObjectiveItem item) {
        this.requiredItems.add(item);
    }
}
