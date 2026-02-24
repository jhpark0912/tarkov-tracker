package com.tarkov.helper.domain.item.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "items")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "api_id", nullable = false, unique = true, length = 100)
    private String apiId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "short_name", length = 100)
    private String shortName;

    @Column(name = "icon_url", length = 500)
    private String iconUrl;

    @Column(name = "wiki_link", length = 500)
    private String wikiLink;

    private Integer width;
    private Integer height;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public void update(String name, String shortName, String iconUrl, String wikiLink,
                       Integer width, Integer height) {
        this.name = name;
        this.shortName = shortName;
        this.iconUrl = iconUrl;
        this.wikiLink = wikiLink;
        this.width = width;
        this.height = height;
    }
}
