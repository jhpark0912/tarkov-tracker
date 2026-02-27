package com.tarkov.helper.domain.hideout.controller;

import com.tarkov.helper.domain.auth.entity.User;
import com.tarkov.helper.domain.hideout.dto.HideoutStationDetail;
import com.tarkov.helper.domain.hideout.dto.HideoutStationListItem;
import com.tarkov.helper.domain.hideout.service.HideoutService;
import com.tarkov.helper.domain.progress.dto.*;
import com.tarkov.helper.domain.progress.service.HideoutProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hideout")
@RequiredArgsConstructor
public class HideoutController {

    private final HideoutService hideoutService;
    private final HideoutProgressService hideoutProgressService;

    @GetMapping("/stations")
    public ResponseEntity<List<HideoutStationListItem>> getStationList() {
        return ResponseEntity.ok(hideoutService.getStationList());
    }

    @GetMapping("/stations/{apiId}")
    public ResponseEntity<HideoutStationDetail> getStationDetail(@PathVariable String apiId) {
        return ResponseEntity.ok(hideoutService.getStationDetail(apiId));
    }

    @GetMapping("/progress")
    public ResponseEntity<HideoutProgressResponse> getProgress(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(hideoutProgressService.getUserHideoutProgress(user.getId()));
    }

    @PutMapping("/progress/station/{apiId}")
    public ResponseEntity<HideoutStationProgressResponse> updateStationLevel(
            @AuthenticationPrincipal User user,
            @PathVariable String apiId,
            @RequestBody HideoutLevelUpdateRequest request) {
        return ResponseEntity.ok(hideoutProgressService.updateStationLevel(user, apiId, request.level()));
    }

    @PutMapping("/progress/item/{reqId}")
    public ResponseEntity<HideoutItemProgressResponse> updateItemProgress(
            @AuthenticationPrincipal User user,
            @PathVariable Long reqId,
            @RequestBody HideoutItemUpdateRequest request) {
        return ResponseEntity.ok(hideoutProgressService.updateItemProgress(user, reqId, request.collectedCount()));
    }
}
