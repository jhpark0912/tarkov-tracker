package com.tarkov.helper.domain.item.controller;

import com.tarkov.helper.domain.auth.entity.User;
import com.tarkov.helper.domain.item.dto.KeyDetail;
import com.tarkov.helper.domain.item.dto.KeyListItem;
import com.tarkov.helper.domain.item.service.KeyService;
import com.tarkov.helper.domain.progress.dto.KeyProgressResponse;
import com.tarkov.helper.domain.progress.dto.KeyProgressUpdateRequest;
import com.tarkov.helper.domain.progress.service.KeyProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/keys")
@RequiredArgsConstructor
public class KeyController {

    private final KeyService keyService;
    private final KeyProgressService keyProgressService;

    @GetMapping
    public ResponseEntity<List<KeyListItem>> getKeyList(
            @RequestParam(required = false) String map,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(keyService.getKeyList(map, search));
    }

    @GetMapping("/{apiId}")
    public ResponseEntity<KeyDetail> getKeyDetail(@PathVariable String apiId) {
        return ResponseEntity.ok(keyService.getKeyDetail(apiId));
    }

    @GetMapping("/progress")
    public ResponseEntity<List<KeyProgressResponse>> getKeyProgress(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(keyProgressService.getUserKeyProgress(user.getId()));
    }

    @PutMapping("/progress/{apiId}")
    public ResponseEntity<KeyProgressResponse> updateKeyProgress(
            @AuthenticationPrincipal User user,
            @PathVariable String apiId,
            @RequestBody KeyProgressUpdateRequest request) {
        return ResponseEntity.ok(keyProgressService.updateKeyProgress(user, apiId, request.owned()));
    }
}
