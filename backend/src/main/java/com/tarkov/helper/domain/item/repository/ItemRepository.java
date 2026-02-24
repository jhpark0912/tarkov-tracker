package com.tarkov.helper.domain.item.repository;

import com.tarkov.helper.domain.item.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ItemRepository extends JpaRepository<Item, Long> {
    Optional<Item> findByApiId(String apiId);
}
