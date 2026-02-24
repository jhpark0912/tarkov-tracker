package com.tarkov.helper.domain.quest.service;

import com.tarkov.helper.domain.map.repository.GameMapRepository;
import com.tarkov.helper.domain.quest.dto.QuestDetail;
import com.tarkov.helper.domain.quest.dto.QuestListItem;
import com.tarkov.helper.domain.quest.dto.QuestMapMarker;
import com.tarkov.helper.domain.quest.entity.Quest;
import com.tarkov.helper.domain.quest.entity.QuestObjective;
import com.tarkov.helper.domain.quest.entity.QuestPrerequisite;
import com.tarkov.helper.domain.quest.repository.QuestObjectiveRepository;
import com.tarkov.helper.domain.quest.repository.QuestPrerequisiteRepository;
import com.tarkov.helper.domain.quest.repository.QuestRepository;
import com.tarkov.helper.domain.trader.repository.TraderRepository;
import com.tarkov.helper.global.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuestService {

    private final QuestRepository questRepository;
    private final QuestObjectiveRepository questObjectiveRepository;
    private final QuestPrerequisiteRepository questPrerequisiteRepository;
    private final TraderRepository traderRepository;
    private final GameMapRepository gameMapRepository;

    public List<QuestListItem> getQuestList(String traderName, Boolean kappaRequired, String mapNormalizedName) {
        Long traderId = null;
        if (traderName != null) {
            traderId = traderRepository.findAll().stream()
                    .filter(t -> t.getName().equalsIgnoreCase(traderName))
                    .map(t -> t.getId())
                    .findFirst()
                    .orElse(null);
        }

        Long mapId = null;
        if (mapNormalizedName != null) {
            mapId = gameMapRepository.findByNormalizedName(mapNormalizedName)
                    .map(m -> m.getId())
                    .orElse(null);
        }

        return questRepository.findWithFilters(traderId, kappaRequired, mapId).stream()
                .map(QuestListItem::from)
                .collect(Collectors.toList());
    }

    public QuestDetail getQuestDetail(Long id) {
        Quest quest = questRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("퀘스트를 찾을 수 없습니다: " + id));

        List<QuestObjective> objectives = questObjectiveRepository.findByQuestWithItems(quest);
        List<QuestPrerequisite> prerequisites = questPrerequisiteRepository.findByQuestWithPrereqs(quest);

        return QuestDetail.from(quest, objectives, prerequisites);
    }

    public List<QuestMapMarker> getMapMarkers(Long mapId, String floorId) {
        List<QuestObjective> objectives = questObjectiveRepository.findMapMarkersForMap(mapId);

        return objectives.stream()
                .filter(o -> floorId == null || floorId.equals(o.getFloorId()))
                .map(QuestMapMarker::from)
                .collect(Collectors.toList());
    }
}
