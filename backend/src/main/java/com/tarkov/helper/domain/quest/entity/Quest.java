package com.tarkov.helper.domain.quest.entity;

import com.tarkov.helper.domain.map.entity.GameMap;
import com.tarkov.helper.domain.trader.entity.Trader;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quests")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Quest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "api_id", nullable = false, unique = true, length = 100)
    private String apiId;

    @Column(nullable = false, length = 200)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trader_id")
    private Trader trader;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "map_id")
    private GameMap map;

    @Builder.Default
    @Column(name = "kappa_required")
    private Boolean kappaRequired = false;

    @Builder.Default
    @Column(name = "lightkeeper_required")
    private Boolean lightkeeperRequired = false;

    @Builder.Default
    @Column(name = "min_player_level")
    private Integer minPlayerLevel = 1;

    @Column(name = "wiki_link", length = 500)
    private String wikiLink;

    @Column(name = "task_image_link", length = 500)
    private String taskImageLink;

    @Builder.Default
    private Integer experience = 0;

    @Builder.Default
    private Boolean removed = false;

    @Column(name = "removed_at")
    private LocalDateTime removedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "quest", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<QuestObjective> objectives = new ArrayList<>();

    public void update(String name, Trader trader, GameMap map, Boolean kappaRequired,
                       Boolean lightkeeperRequired,
                       Integer minPlayerLevel, String wikiLink, String taskImageLink, Integer experience) {
        this.name = name;
        this.trader = trader;
        this.map = map;
        this.kappaRequired = kappaRequired;
        this.lightkeeperRequired = lightkeeperRequired;
        this.minPlayerLevel = minPlayerLevel;
        this.wikiLink = wikiLink;
        this.taskImageLink = taskImageLink;
        this.experience = experience;
        this.removed = false;
        this.removedAt = null;
    }

    public void markRemoved() {
        this.removed = true;
        this.removedAt = LocalDateTime.now();
    }
}
