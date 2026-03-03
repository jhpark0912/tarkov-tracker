package com.tarkov.helper.domain.marker.repository;

import com.tarkov.helper.domain.marker.entity.UserMapMarker;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserMapMarkerRepository extends JpaRepository<UserMapMarker, Long> {

    List<UserMapMarker> findAllByUserIdAndMapId(Long userId, Long mapId);

    int countByUserIdAndMapId(Long userId, Long mapId);

    Optional<UserMapMarker> findByIdAndUserId(Long id, Long userId);
}
