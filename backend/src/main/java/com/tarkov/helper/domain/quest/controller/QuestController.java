package com.tarkov.helper.domain.quest.controller;

import com.tarkov.helper.domain.map.repository.GameMapRepository;
import com.tarkov.helper.domain.quest.dto.QuestDetail;
import com.tarkov.helper.domain.quest.dto.QuestListItem;
import com.tarkov.helper.domain.quest.dto.QuestMapMarker;
import com.tarkov.helper.domain.quest.service.QuestService;
import com.tarkov.helper.global.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/quests")
@RequiredArgsConstructor
public class QuestController {

    private final QuestService questService;
    private final GameMapRepository gameMapRepository;

    /**
     * 퀘스트 목록 (필터: trader, kappa, map)
     * GET /api/v1/quests?trader=prapor&kappa=true&map=customs
     */
    @GetMapping
    public ResponseEntity<List<QuestListItem>> getQuestList(
            @RequestParam(required = false) String trader,
            @RequestParam(required = false) Boolean kappa,
            @RequestParam(required = false) String map) {
        return ResponseEntity.ok(questService.getQuestList(trader, kappa, map));
    }

    /**
     * 퀘스트 상세 (목표 + 아이템 포함)
     * GET /api/v1/quests/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<QuestDetail> getQuestDetail(@PathVariable Long id) {
        return ResponseEntity.ok(questService.getQuestDetail(id));
    }

    /**
     * 맵별 퀘스트 마커 목록
     * GET /api/v1/quests/map/{mapId}?floor=Ground_Level
     */
    @GetMapping("/map/{mapId}")
    public ResponseEntity<List<QuestMapMarker>> getMapMarkers(
            @PathVariable Long mapId,
            @RequestParam(required = false) String floor) {
        // mapId 존재 여부 검증
        gameMapRepository.findById(mapId)
                .orElseThrow(() -> new ResourceNotFoundException("맵을 찾을 수 없습니다: " + mapId));
        return ResponseEntity.ok(questService.getMapMarkers(mapId, floor));
    }
}
