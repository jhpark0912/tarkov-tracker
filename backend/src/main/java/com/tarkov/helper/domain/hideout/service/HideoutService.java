package com.tarkov.helper.domain.hideout.service;

import com.tarkov.helper.domain.hideout.dto.HideoutStationDetail;
import com.tarkov.helper.domain.hideout.dto.HideoutStationListItem;
import com.tarkov.helper.domain.hideout.entity.HideoutLevel;
import com.tarkov.helper.domain.hideout.entity.HideoutStation;
import com.tarkov.helper.domain.hideout.repository.HideoutLevelRepository;
import com.tarkov.helper.domain.hideout.repository.HideoutStationRepository;
import com.tarkov.helper.global.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HideoutService {

    private final HideoutStationRepository stationRepository;
    private final HideoutLevelRepository levelRepository;

    public List<HideoutStationListItem> getStationList() {
        return stationRepository.findAllWithLevels().stream()
                .map(HideoutStationListItem::from)
                .collect(Collectors.toList());
    }

    public HideoutStationDetail getStationDetail(String apiId) {
        HideoutStation station = stationRepository.findByApiId(apiId)
                .orElseThrow(() -> new ResourceNotFoundException("은신처 스테이션을 찾을 수 없습니다: " + apiId));

        List<HideoutLevel> levels = levelRepository.findByStationApiIdWithRequirements(apiId);
        return HideoutStationDetail.from(station, levels);
    }
}
