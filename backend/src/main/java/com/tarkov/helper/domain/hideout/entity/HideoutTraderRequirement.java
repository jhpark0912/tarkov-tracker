package com.tarkov.helper.domain.hideout.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hideout_trader_requirements")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HideoutTraderRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hideout_level_id", nullable = false)
    private HideoutLevel hideoutLevel;

    @Column(name = "trader_api_id", nullable = false, length = 100)
    private String traderApiId;

    @Column(name = "trader_name")
    private String traderName;

    @Column(name = "loyalty_level", nullable = false)
    private Integer loyaltyLevel;
}
