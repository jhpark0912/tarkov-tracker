package com.tarkov.helper.sync.scheduler;

import com.tarkov.helper.sync.dto.SyncResult;
import com.tarkov.helper.sync.service.DataSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SyncScheduler {

    private final DataSyncService dataSyncService;

    @Value("${tarkov.sync.enabled:true}")
    private boolean syncEnabled;

    @Scheduled(cron = "${tarkov.sync.cron}")
    public void scheduledSync() {
        if (!syncEnabled) {
            log.debug("스케줄 동기화 비활성화 상태. 건너뜁니다.");
            return;
        }

        log.info("스케줄 동기화 시작 (매월 1일 03시)");
        try {
            SyncResult result = dataSyncService.syncAll();
            log.info("스케줄 동기화 완료: {}", result);
        } catch (Exception e) {
            log.error("스케줄 동기화 실패: {}", e.getMessage(), e);
        }
    }
}
