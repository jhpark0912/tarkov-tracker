package com.tarkov.helper.domain.hideout.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hideout_skill_requirements")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HideoutSkillRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hideout_level_id", nullable = false)
    private HideoutLevel hideoutLevel;

    @Column(name = "skill_name", nullable = false, length = 100)
    private String skillName;

    @Column(name = "skill_level", nullable = false)
    private Integer skillLevel;
}
