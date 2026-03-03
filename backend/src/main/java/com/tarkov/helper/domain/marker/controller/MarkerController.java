package com.tarkov.helper.domain.marker.controller;

import com.tarkov.helper.domain.auth.entity.User;
import com.tarkov.helper.domain.marker.dto.MarkerCreateRequest;
import com.tarkov.helper.domain.marker.dto.MarkerResponse;
import com.tarkov.helper.domain.marker.dto.MarkerUpdateRequest;
import com.tarkov.helper.domain.marker.service.MarkerService;
import com.tarkov.helper.global.exception.UnauthorizedException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/markers")
@RequiredArgsConstructor
public class MarkerController {

    private final MarkerService markerService;

    private User requireUser(User user) {
        if (user == null) throw new UnauthorizedException("인증이 필요합니다");
        return user;
    }

    @GetMapping
    public ResponseEntity<List<MarkerResponse>> getMarkers(
            @AuthenticationPrincipal User user,
            @RequestParam Long mapId) {
        return ResponseEntity.ok(markerService.getMarkers(requireUser(user).getId(), mapId));
    }

    @PostMapping
    public ResponseEntity<MarkerResponse> createMarker(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody MarkerCreateRequest request) {
        return ResponseEntity.ok(markerService.createMarker(requireUser(user), request));
    }

    @PutMapping("/{markerId}")
    public ResponseEntity<MarkerResponse> updateMarker(
            @AuthenticationPrincipal User user,
            @PathVariable Long markerId,
            @Valid @RequestBody MarkerUpdateRequest request) {
        return ResponseEntity.ok(markerService.updateMarker(requireUser(user).getId(), markerId, request));
    }

    @DeleteMapping("/{markerId}")
    public ResponseEntity<Void> deleteMarker(
            @AuthenticationPrincipal User user,
            @PathVariable Long markerId) {
        markerService.deleteMarker(requireUser(user).getId(), markerId);
        return ResponseEntity.noContent().build();
    }
}