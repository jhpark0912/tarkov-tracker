package com.tarkov.helper.domain.map.controller;

import com.tarkov.helper.domain.map.dto.MapDetail;
import com.tarkov.helper.domain.map.dto.MapListItem;
import com.tarkov.helper.domain.map.dto.MapPositionData;
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

    @GetMapping
    public ResponseEntity<List<MapListItem>> getMapList() {
        return ResponseEntity.ok(mapService.getMapList());
    }

    @GetMapping("/{normalizedName}")
    public ResponseEntity<MapDetail> getMapDetail(@PathVariable String normalizedName) {
        return ResponseEntity.ok(mapService.getMapDetail(normalizedName));
    }

    @GetMapping("/{normalizedName}/positions")
    public ResponseEntity<MapPositionData> getMapPositions(@PathVariable String normalizedName) {
        return ResponseEntity.ok(mapService.getMapPositions(normalizedName));
    }
}
