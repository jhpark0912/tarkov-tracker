package com.tarkov.helper.domain.map.controller;

import com.tarkov.helper.domain.map.dto.MapDetail;
import com.tarkov.helper.domain.map.dto.MapListItem;
import com.tarkov.helper.domain.map.service.MapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/maps")
@RequiredArgsConstructor
public class MapController {

    private final MapService mapService;

    /**
     * 전체 맵 목록
     * GET /api/v1/maps
     */
    @GetMapping
    public ResponseEntity<List<MapListItem>> getMapList() {
        return ResponseEntity.ok(mapService.getMapList());
    }

    /**
     * 맵 상세 (층 정보 포함)
     * GET /api/v1/maps/{normalizedName}
     */
    @GetMapping("/{normalizedName}")
    public ResponseEntity<MapDetail> getMapDetail(@PathVariable String normalizedName) {
        return ResponseEntity.ok(mapService.getMapDetail(normalizedName));
    }
}
