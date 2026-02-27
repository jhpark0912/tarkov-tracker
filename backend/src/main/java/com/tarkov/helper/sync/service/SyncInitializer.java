package com.tarkov.helper.sync.service;

import com.tarkov.helper.domain.hideout.repository.HideoutStationRepository;
import com.tarkov.helper.domain.quest.repository.QuestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * 서버 시작 시 DB가 비어있으면 초기 동기화 실행.
 * DataSyncService와 분리하여 @Transactional 프록시가 정상 동작하도록 처리.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SyncInitializer {

    private final QuestRepository questRepository;
    private final HideoutStationRepository hideoutStationRepository;
    private final DataSyncService dataSyncService;

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        boolean questsEmpty = questRepository.count() == 0;
        boolean hideoutEmpty = hideoutStationRepository.count() == 0;

        if (questsEmpty || hideoutEmpty) {
            String reason = questsEmpty ? "퀘스트 데이터 없음" : "은신처 데이터 없음";
            log.info("초기 동기화를 시작합니다. (사유: {})", reason);
            try {
                dataSyncService.syncAll();
            } catch (Exception e) {
                log.error("초기 동기화 실패: {}", e.getMessage(), e);
            }
        } else {
            log.debug("기존 데이터 존재. 초기 동기화 생략.");
        }
    }
}
