package com.tarkov.helper.domain.trader.repository;

import com.tarkov.helper.domain.trader.entity.Trader;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TraderRepository extends JpaRepository<Trader, Long> {
    Optional<Trader> findByApiId(String apiId);
    Optional<Trader> findByNameIgnoreCase(String name);
}
