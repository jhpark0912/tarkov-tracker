package com.tarkov.helper.sync.controller;

import com.tarkov.helper.sync.dto.SyncResult;
import com.tarkov.helper.sync.service.DataSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class SyncController {

    private final DataSyncService dataSyncService;

    /**
     * 수동 동기화 트리거 (게임 패치 직후 사용)
     * POST /api/v1/admin/sync
     */
    @PostMapping("/sync")
    public ResponseEntity<SyncResult> triggerSync() {
        log.info("수동 동기화 요청");
        SyncResult result = dataSyncService.syncAll();
        return ResponseEntity.ok(result);
    }
}
