package com.tarkov.helper.domain.hideout.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "hideout_stations")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HideoutStation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "api_id", nullable = false, unique = true, length = 100)
    private String apiId;

    @Column(nullable = false)
    private String name;

    @Column(name = "normalized_name", length = 100)
    private String normalizedName;

    @Column(name = "image_link", length = 500)
    private String imageLink;

    @OneToMany(mappedBy = "station", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("level ASC")
    @Builder.Default
    private List<HideoutLevel> levels = new ArrayList<>();

    public void update(String name, String normalizedName, String imageLink) {
        this.name = name;
        this.normalizedName = normalizedName;
        this.imageLink = imageLink;
    }
}
