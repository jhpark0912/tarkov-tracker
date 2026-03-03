package com.tarkov.helper.domain.marker.service;

import com.tarkov.helper.domain.auth.entity.User;
import com.tarkov.helper.domain.map.entity.GameMap;
import com.tarkov.helper.domain.map.repository.GameMapRepository;
import com.tarkov.helper.domain.marker.dto.MarkerCreateRequest;
import com.tarkov.helper.domain.marker.dto.MarkerResponse;
import com.tarkov.helper.domain.marker.dto.MarkerUpdateRequest;
import com.tarkov.helper.domain.marker.entity.UserMapMarker;
import com.tarkov.helper.domain.marker.repository.UserMapMarkerRepository;
import com.tarkov.helper.global.exception.MarkerLimitExceededException;
import com.tarkov.helper.global.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MarkerService {

    private static final int MAX_MARKERS_PER_MAP = 50;

    private final UserMapMarkerRepository markerRepository;
    private final GameMapRepository gameMapRepository;

    @Transactional(readOnly = true)
    public List<MarkerResponse> getMarkers(Long userId, Long mapId) {
        return markerRepository.findAllByUserIdAndMapId(userId, mapId)
                .stream()
                .map(MarkerResponse::from)
                .toList();
    }

    @Transactional
    public MarkerResponse createMarker(User user, MarkerCreateRequest request) {
        int count = markerRepository.countByUserIdAndMapId(user.getId(), request.mapId());
        if (count >= MAX_MARKERS_PER_MAP) {
            throw new MarkerLimitExceededException("맵당 최대 " + MAX_MARKERS_PER_MAP + "개의 마커만 등록할 수 있습니다.");
        }

        GameMap gameMap = gameMapRepository.findById(request.mapId())
                .orElseThrow(() -> new ResourceNotFoundException("map not found: " + request.mapId()));

        UserMapMarker marker = UserMapMarker.builder()
                .user(user)
                .map(gameMap)
                .floorId(request.floorId())
                .positionX(request.positionX())
                .positionY(request.positionY())
                .title(request.title())
                .description(request.description())
                .markerType(request.type())
                .color(request.color())
                .build();

        UserMapMarker saved = markerRepository.save(marker);
        log.debug("created marker {} for user {} on map {}", saved.getId(), user.getId(), request.mapId());
        return MarkerResponse.from(saved);
    }

    @Transactional
    public MarkerResponse updateMarker(Long userId, Long markerId, MarkerUpdateRequest request) {
        UserMapMarker marker = markerRepository.findByIdAndUserId(markerId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("marker not found: " + markerId));

        marker.update(request.title(), request.description(), request.type(), request.color());
        UserMapMarker saved = markerRepository.save(marker);
        log.debug("updated marker {} for user {}", markerId, userId);
        return MarkerResponse.from(saved);
    }

    @Transactional
    public void deleteMarker(Long userId, Long markerId) {
        UserMapMarker marker = markerRepository.findByIdAndUserId(markerId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("marker not found: " + markerId));

        markerRepository.delete(marker);
        log.debug("deleted marker {} for user {}", markerId, userId);
    }
}
