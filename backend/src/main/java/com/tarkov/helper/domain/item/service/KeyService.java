package com.tarkov.helper.domain.item.service;

import com.tarkov.helper.domain.item.dto.KeyDetail;
import com.tarkov.helper.domain.item.dto.KeyListItem;
import com.tarkov.helper.domain.item.entity.Item;
import com.tarkov.helper.domain.item.repository.ItemRepository;
import com.tarkov.helper.domain.map.entity.MapLock;
import com.tarkov.helper.domain.map.repository.GameMapRepository;
import com.tarkov.helper.domain.map.repository.MapLockRepository;
import com.tarkov.helper.domain.quest.entity.QuestObjective;
import com.tarkov.helper.domain.quest.entity.QuestObjectiveItem;
import com.tarkov.helper.domain.quest.repository.QuestObjectiveRepository;
import com.tarkov.helper.global.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class KeyService {

    private final MapLockRepository mapLockRepository;
    private final ItemRepository itemRepository;
    private final GameMapRepository gameMapRepository;
    private final QuestObjectiveRepository questObjectiveRepository;

    public List<KeyListItem> getKeyList(String mapNormalizedName, String search) {
        List<MapLock> allLocks = mapLockRepository.findAllWithKeys();

        // keyApiId 기준으로 그룹핑
        Map<String, List<MapLock>> locksByKey = allLocks.stream()
                .collect(Collectors.groupingBy(MapLock::getKeyApiId));

        // 맵 필터 적용
        if (mapNormalizedName != null && !mapNormalizedName.isBlank()) {
            locksByKey = locksByKey.entrySet().stream()
                    .filter(e -> e.getValue().stream()
                            .anyMatch(l -> mapNormalizedName.equals(l.getGameMap().getNormalizedName())))
                    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
        }

        // 퀘스트 관련 아이템 조회 (벌크)
        Map<String, Integer> questCountByApiId = countQuestsByKeyApiIds(locksByKey.keySet());

        List<KeyListItem> result = new ArrayList<>();
        for (Map.Entry<String, List<MapLock>> entry : locksByKey.entrySet()) {
            String keyApiId = entry.getKey();
            List<MapLock> locks = entry.getValue();
            MapLock sample = locks.get(0);

            String name = sample.getKeyName() != null ? sample.getKeyName() : keyApiId;
            String shortName = sample.getKeyShortName();

            // 검색 필터
            if (search != null && !search.isBlank()) {
                String lower = search.toLowerCase();
                boolean matches = (name != null && name.toLowerCase().contains(lower))
                        || (shortName != null && shortName.toLowerCase().contains(lower));
                if (!matches) continue;
            }

            List<String> mapNames = locks.stream()
                    .map(l -> l.getGameMap().getName())
                    .distinct()
                    .sorted()
                    .collect(Collectors.toList());

            result.add(new KeyListItem(
                    keyApiId,
                    name,
                    shortName,
                    sample.getKeyIconUrl(),
                    locks.size(),
                    questCountByApiId.getOrDefault(keyApiId, 0),
                    mapNames
            ));
        }

        result.sort(Comparator.comparing(KeyListItem::name, String.CASE_INSENSITIVE_ORDER));
        return result;
    }

    public KeyDetail getKeyDetail(String apiId) {
        List<MapLock> locks = mapLockRepository.findByKeyApiId(apiId);
        if (locks.isEmpty()) {
            throw new ResourceNotFoundException("키를 찾을 수 없습니다: " + apiId);
        }

        MapLock sample = locks.get(0);
        String name = sample.getKeyName() != null ? sample.getKeyName() : apiId;

        // wikiLink는 Item 테이블에서 조회
        String wikiLink = itemRepository.findByApiId(apiId)
                .map(Item::getWikiLink)
                .orElse(null);

        // 문 목록 (각 MapLock이 하나의 문)
        List<KeyDetail.KeyDoor> doors = locks.stream()
                .map(l -> new KeyDetail.KeyDoor(
                        l.getId(),
                        l.getLockType(),
                        l.getNeedsPower(),
                        l.getGameMap().getName(),
                        l.getGameMap().getNormalizedName(),
                        l.getFloorId(),
                        l.getPositionX(),
                        l.getPositionY()
                ))
                .collect(Collectors.toList());

        // 퀘스트 목록: Item → QuestObjectiveItem → QuestObjective → Quest
        List<KeyDetail.KeyQuest> quests = findQuestsForKey(apiId);

        return new KeyDetail(apiId, name, sample.getKeyShortName(),
                sample.getKeyIconUrl(), wikiLink, doors, quests);
    }

    private List<KeyDetail.KeyQuest> findQuestsForKey(String keyApiId) {
        Item item = itemRepository.findByApiId(keyApiId).orElse(null);
        if (item == null) return List.of();

        List<QuestObjective> objectives = questObjectiveRepository.findByRequiredItemId(item.getId());

        return objectives.stream()
                .filter(o -> o.getQuest() != null && !o.getQuest().getRemoved())
                .map(o -> new KeyDetail.KeyQuest(
                        o.getQuest().getId(),
                        o.getQuest().getName(),
                        o.getQuest().getTrader() != null ? o.getQuest().getTrader().getName() : null
                ))
                .distinct()
                .collect(Collectors.toList());
    }

    private Map<String, Integer> countQuestsByKeyApiIds(Set<String> keyApiIds) {
        if (keyApiIds.isEmpty()) return Map.of();

        Map<String, Integer> result = new HashMap<>();
        for (String keyApiId : keyApiIds) {
            Item item = itemRepository.findByApiId(keyApiId).orElse(null);
            if (item == null) {
                result.put(keyApiId, 0);
                continue;
            }
            List<QuestObjective> objectives = questObjectiveRepository.findByRequiredItemId(item.getId());
            long count = objectives.stream()
                    .filter(o -> o.getQuest() != null && !o.getQuest().getRemoved())
                    .map(o -> o.getQuest().getId())
                    .distinct()
                    .count();
            result.put(keyApiId, (int) count);
        }
        return result;
    }
}
