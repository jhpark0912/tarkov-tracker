package com.tarkov.helper.domain.hideout.entity;

import com.tarkov.helper.domain.item.entity.Item;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.BatchSize;

@Entity
@Table(name = "hideout_item_requirements")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HideoutItemRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hideout_level_id", nullable = false)
    private HideoutLevel hideoutLevel;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "item_id", nullable = false)
    @BatchSize(size = 30)
    private Item item;

    @Column(nullable = false)
    @Builder.Default
    private Integer count = 1;

    public void updateCount(Integer count) {
        this.count = count;
    }
}
