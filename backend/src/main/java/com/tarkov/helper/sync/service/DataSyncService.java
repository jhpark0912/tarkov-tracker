package com.tarkov.helper.sync.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tarkov.helper.domain.item.entity.Item;
import com.tarkov.helper.domain.item.repository.ItemRepository;
import com.tarkov.helper.domain.map.entity.GameMap;
import com.tarkov.helper.domain.map.entity.MapFloor;
import com.tarkov.helper.domain.map.repository.GameMapRepository;
import com.tarkov.helper.domain.map.repository.MapFloorRepository;
import com.tarkov.helper.domain.quest.entity.*;
import com.tarkov.helper.domain.quest.repository.*;
import com.tarkov.helper.domain.trader.entity.Trader;
import com.tarkov.helper.domain.trader.repository.TraderRepository;
import com.tarkov.helper.sync.client.TarkovApiClient;
import com.tarkov.helper.sync.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DataSyncService {

    private final TarkovApiClient tarkovApiClient;
    private final TraderRepository traderRepository;
    private final GameMapRepository gameMapRepository;
    private final MapFloorRepository mapFloorRepository;
    private final ItemRepository itemRepository;
    private final QuestRepository questRepository;
    private final QuestObjectiveRepository questObjectiveRepository;
    private final QuestPrerequisiteRepository questPrerequisiteRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public SyncResult syncAll() {
        long startTime = System.currentTimeMillis();
        log.info("데이터 동기화 시작");

        List<TarkovTaskDto> tasks = tarkovApiClient.fetchTasks();
        List<TarkovMapDto> apiMaps = tarkovApiClient.fetchMaps();

        if (tasks.isEmpty()) {
            log.warn("API에서 퀘스트 데이터를 받지 못했습니다. 동기화를 중단합니다.");
            return SyncResult.builder().build();
        }

        // 1. 맵 동기화 (API + 메타데이터)
        Map<String, GameMap> mapCache = syncMaps(tasks, apiMaps);

        // 2. 딜러 동기화
        Map<String, Trader> traderCache = syncTraders(tasks);

        // 3. 아이템 동기화 (objectives에서 추출)
        Map<String, Item> itemCache = syncItems(tasks);

        // 4. 퀘스트 1차 (선행조건 없이 기본 데이터만)
        int[] questStats = new int[2]; // [0]=added, [1]=updated
        Map<String, Quest> questCache = syncQuestBase(tasks, traderCache, mapCache, questStats);

        // 5. 퀘스트 선행조건 동기화
        syncQuestPrerequisites(tasks, questCache);

        // 6. 퀘스트 목표 + 목표 아이템 동기화
        Map<String, GpsData> gpsCache = loadObjectiveGps();
        syncQuestObjectives(tasks, questCache, mapCache, itemCache, gpsCache);

        // 7. 삭제된 퀘스트 soft delete
        Set<String> apiQuestIds = tasks.stream().map(TarkovTaskDto::getId).collect(Collectors.toSet());
        int removedCount = softDeleteRemovedQuests(apiQuestIds);

        long duration = System.currentTimeMillis() - startTime;
        SyncResult result = SyncResult.builder()
                .tradersProcessed(traderCache.size())
                .mapsProcessed(mapCache.size())
                .itemsProcessed(itemCache.size())
                .questsAdded(questStats[0])
                .questsUpdated(questStats[1])
                .questsRemoved(removedCount)
                .durationMs(duration)
                .build();

        log.info(result.toString());
        return result;
    }

    // ─── 맵 동기화 ────────────────────────────────────────────────────────────

    private Map<String, GameMap> syncMaps(List<TarkovTaskDto> tasks, List<TarkovMapDto> apiMaps) {
        Map<String, MapMetadata> metadata = loadMapMetadata();
        Map<String, GameMap> cache = new HashMap<>();

        // API maps 기준으로 upsert
        for (TarkovMapDto dto : apiMaps) {
            GameMap map = upsertMap(dto.getId(), dto.getName(), dto.getNormalizedName(), metadata);
            cache.put(dto.getId(), map);
        }

        // tasks 내 embed 맵도 처리 (API maps에 없는 경우 보완)
        for (TarkovTaskDto task : tasks) {
            if (task.getMap() == null) continue;
            TarkovMapReferenceDto ref = task.getMap();
            if (!cache.containsKey(ref.getId())) {
                GameMap map = upsertMap(ref.getId(), ref.getName(), ref.getNormalizedName(), metadata);
                cache.put(ref.getId(), map);
            }
        }

        log.debug("맵 동기화 완료: {}건", cache.size());
        return cache;
    }

    private GameMap upsertMap(String apiId, String name, String normalizedName, Map<String, MapMetadata> metadata) {
        GameMap map = gameMapRepository.findByApiId(apiId).orElse(null);
        MapMetadata meta = metadata.getOrDefault(normalizedName, new MapMetadata());

        if (meta.svgFile() == null) {
            log.warn("maps-metadata.json에 '{}' 항목 없음 — SVG/층 정보 미적용. 신규 맵이면 메타데이터를 추가하세요.", normalizedName);
        }

        if (map == null) {
            map = gameMapRepository.save(GameMap.builder()
                    .apiId(apiId)
                    .name(name)
                    .normalizedName(normalizedName)
                    .svgFile(meta.svgFile())
                    .defaultFloor(meta.defaultFloor())
                    .coordinateRotation(meta.coordinateRotation())
                    .build());
        } else {
            map.update(name);
            map.updateMetadata(meta.svgFile(), meta.defaultFloor(), meta.coordinateRotation());
        }

        // 층 데이터 재동기화
        if (meta.floors() != null && !meta.floors().isEmpty()) {
            mapFloorRepository.deleteByGameMap(map);
            for (int i = 0; i < meta.floors().size(); i++) {
                FloorMetadata floorMeta = meta.floors().get(i);
                mapFloorRepository.save(MapFloor.builder()
                        .gameMap(map)
                        .floorId(floorMeta.floorId())
                        .floorLabel(floorMeta.floorLabel())
                        .floorOrder(floorMeta.floorOrder() != null ? floorMeta.floorOrder() : i)
                        .build());
            }
        }

        return map;
    }

    // ─── 딜러 동기화 ──────────────────────────────────────────────────────────

    private Map<String, Trader> syncTraders(List<TarkovTaskDto> tasks) {
        Map<String, Trader> cache = new HashMap<>();

        for (TarkovTaskDto task : tasks) {
            if (task.getTrader() == null) continue;
            TarkovTraderDto dto = task.getTrader();
            if (cache.containsKey(dto.getId())) continue;

            Trader trader = traderRepository.findByApiId(dto.getId()).orElse(null);
            if (trader == null) {
                trader = traderRepository.save(Trader.builder()
                        .apiId(dto.getId())
                        .name(dto.getName())
                        .imageUrl(dto.getImageLink())
                        .build());
            } else {
                trader.update(dto.getName(), dto.getImageLink());
            }
            cache.put(dto.getId(), trader);
        }

        log.debug("딜러 동기화 완료: {}건", cache.size());
        return cache;
    }

    // ─── 아이템 동기화 ────────────────────────────────────────────────────────

    private Map<String, Item> syncItems(List<TarkovTaskDto> tasks) {
        Map<String, Item> cache = new HashMap<>();

        for (TarkovTaskDto task : tasks) {
            if (task.getObjectives() == null) continue;
            for (TarkovObjectiveDto obj : task.getObjectives()) {
                upsertItemFromDto(obj.getItem(), cache);
                upsertItemFromDto(obj.getMarkerItem(), cache);
                if (obj.getItems() != null) {
                    obj.getItems().forEach(item -> upsertItemFromDto(item, cache));
                }
            }
        }

        log.debug("아이템 동기화 완료: {}건", cache.size());
        return cache;
    }

    private void upsertItemFromDto(TarkovItemDto dto, Map<String, Item> cache) {
        if (dto == null || dto.getId() == null) return;
        if (cache.containsKey(dto.getId())) return;

        Item item = itemRepository.findByApiId(dto.getId()).orElse(null);
        if (item == null) {
            item = itemRepository.save(Item.builder()
                    .apiId(dto.getId())
                    .name(dto.getName())
                    .shortName(dto.getShortName())
                    .iconUrl(dto.getIconLink())
                    .wikiLink(dto.getWikiLink())
                    .width(dto.getWidth())
                    .height(dto.getHeight())
                    .build());
        } else {
            item.update(dto.getName(), dto.getShortName(), dto.getIconLink(),
                    dto.getWikiLink(), dto.getWidth(), dto.getHeight());
        }
        cache.put(dto.getId(), item);
    }

    // ─── 퀘스트 1차 동기화 (선행조건 제외) ───────────────────────────────────

    private Map<String, Quest> syncQuestBase(List<TarkovTaskDto> tasks,
                                             Map<String, Trader> traderCache,
                                             Map<String, GameMap> mapCache,
                                             int[] stats) {
        Map<String, Quest> cache = new HashMap<>();

        for (TarkovTaskDto dto : tasks) {
            Trader trader = dto.getTrader() != null ? traderCache.get(dto.getTrader().getId()) : null;
            GameMap map = dto.getMap() != null ? mapCache.get(dto.getMap().getId()) : null;

            Quest quest = questRepository.findByApiId(dto.getId()).orElse(null);
            if (quest == null) {
                quest = questRepository.save(Quest.builder()
                        .apiId(dto.getId())
                        .name(dto.getName())
                        .trader(trader)
                        .map(map)
                        .kappaRequired(Boolean.TRUE.equals(dto.getKappaRequired()))
                        .minPlayerLevel(dto.getMinPlayerLevel() != null ? dto.getMinPlayerLevel() : 1)
                        .wikiLink(dto.getWikiLink())
                        .taskImageLink(dto.getTaskImageLink())
                        .experience(dto.getExperience() != null ? dto.getExperience() : 0)
                        .build());
                stats[0]++; // added
            } else {
                quest.update(
                        dto.getName(), trader, map,
                        Boolean.TRUE.equals(dto.getKappaRequired()),
                        dto.getMinPlayerLevel() != null ? dto.getMinPlayerLevel() : 1,
                        dto.getWikiLink(), dto.getTaskImageLink(),
                        dto.getExperience() != null ? dto.getExperience() : 0
                );
                stats[1]++; // updated
            }
            cache.put(dto.getId(), quest);
        }

        log.debug("퀘스트 1차 동기화 완료: {}건 (추가: {}, 갱신: {})", cache.size(), stats[0], stats[1]);
        return cache;
    }

    // ─── 퀘스트 선행조건 동기화 ───────────────────────────────────────────────

    private void syncQuestPrerequisites(List<TarkovTaskDto> tasks, Map<String, Quest> questCache) {
        for (TarkovTaskDto dto : tasks) {
            Quest quest = questCache.get(dto.getId());
            if (quest == null) continue;

            questPrerequisiteRepository.deleteByQuest(quest);

            if (dto.getTaskRequirements() == null) continue;
            for (TarkovTaskDto.TarkovTaskRequirementDto req : dto.getTaskRequirements()) {
                if (req.getTask() == null) continue;
                Quest prereq = questCache.get(req.getTask().getId());
                if (prereq == null) continue;

                questPrerequisiteRepository.save(QuestPrerequisite.builder()
                        .quest(quest)
                        .prereqQuest(prereq)
                        .build());
            }
        }
        log.debug("퀘스트 선행조건 동기화 완료");
    }

    // ─── 퀘스트 목표 + 아이템 동기화 ─────────────────────────────────────────

    private void syncQuestObjectives(List<TarkovTaskDto> tasks,
                                     Map<String, Quest> questCache,
                                     Map<String, GameMap> mapCache,
                                     Map<String, Item> itemCache,
                                     Map<String, GpsData> gpsCache) {
        for (TarkovTaskDto dto : tasks) {
            Quest quest = questCache.get(dto.getId());
            if (quest == null || dto.getObjectives() == null) continue;

            for (TarkovObjectiveDto objDto : dto.getObjectives()) {
                if (objDto.getId() == null) continue;

                GameMap objMap = resolveObjectiveMap(objDto, mapCache);
                GpsData gps = gpsCache.get(objDto.getId());

                QuestObjective objective = questObjectiveRepository.findByApiId(objDto.getId()).orElse(null);
                if (objective == null) {
                    objective = QuestObjective.builder()
                            .quest(quest)
                            .apiId(objDto.getId())
                            .type(objDto.getType() != null ? objDto.getType() : "unknown")
                            .description(objDto.getDescription() != null ? objDto.getDescription() : "")
                            .map(objMap)
                            .optional(Boolean.TRUE.equals(objDto.getOptional()))
                            .build();
                    objective = questObjectiveRepository.save(objective);
                } else {
                    objective.update(
                            objDto.getType() != null ? objDto.getType() : "unknown",
                            objDto.getDescription() != null ? objDto.getDescription() : "",
                            objMap,
                            Boolean.TRUE.equals(objDto.getOptional())
                    );
                }

                // GPS 좌표 업데이트
                if (gps != null) {
                    objective.updatePosition(gps.leftPercent(), gps.topPercent(), gps.floor());
                }

                // 아이템 목록 재동기화
                objective.clearRequiredItems();
                syncObjectiveItems(objective, objDto, itemCache);
            }
        }
        log.debug("퀘스트 목표 동기화 완료");
    }

    private GameMap resolveObjectiveMap(TarkovObjectiveDto objDto, Map<String, GameMap> mapCache) {
        if (objDto.getMaps() != null && !objDto.getMaps().isEmpty()) {
            String mapId = objDto.getMaps().get(0).getId();
            return mapCache.get(mapId);
        }
        return null;
    }

    private void syncObjectiveItems(QuestObjective objective, TarkovObjectiveDto objDto,
                                    Map<String, Item> itemCache) {
        // TaskObjectiveItem: item 또는 items 필드
        List<TarkovItemDto> itemDtos = new ArrayList<>();
        if (objDto.getItem() != null) {
            itemDtos.add(objDto.getItem());
        } else if (objDto.getItems() != null) {
            itemDtos.addAll(objDto.getItems());
        }
        // TaskObjectiveMark: markerItem
        if (objDto.getMarkerItem() != null) {
            itemDtos.add(objDto.getMarkerItem());
        }

        for (TarkovItemDto itemDto : itemDtos) {
            Item item = itemCache.get(itemDto.getId());
            if (item == null) continue;

            QuestObjectiveItem objItem = QuestObjectiveItem.builder()
                    .objective(objective)
                    .item(item)
                    .count(objDto.getCount() != null ? objDto.getCount() : 1)
                    .foundInRaid(Boolean.TRUE.equals(objDto.getFoundInRaid()))
                    .build();
            objective.addRequiredItem(objItem);
        }
    }

    // ─── Soft Delete ───────────────────────────────────────────────────────────

    private int softDeleteRemovedQuests(Set<String> apiQuestIds) {
        Set<String> dbApiIds = questRepository.findAllActiveApiIds();
        Set<String> removedIds = new HashSet<>(dbApiIds);
        removedIds.removeAll(apiQuestIds);

        int count = 0;
        for (String apiId : removedIds) {
            questRepository.findByApiId(apiId).ifPresent(quest -> {
                quest.markRemoved();
                log.debug("퀘스트 soft delete: {} ({})", quest.getName(), apiId);
            });
            count++;
        }

        if (count > 0) {
            log.info("퀘스트 {}건 soft delete 처리", count);
        }
        return count;
    }

    // ─── 메타데이터 로딩 ──────────────────────────────────────────────────────

    private Map<String, MapMetadata> loadMapMetadata() {
        try {
            ClassPathResource resource = new ClassPathResource("data/maps-metadata.json");
            Map<String, MapMetadata> raw = objectMapper.readValue(resource.getInputStream(),
                    new TypeReference<Map<String, MapMetadata>>() {});

            // aliases 전개: alias로 조회해도 동일 메타데이터 반환
            Map<String, MapMetadata> expanded = new HashMap<>(raw);
            raw.forEach((key, meta) -> {
                if (meta.aliases() != null) {
                    meta.aliases().forEach(alias -> expanded.put(alias, meta));
                }
            });
            return expanded;
        } catch (IOException e) {
            log.warn("maps-metadata.json 로딩 실패. 층 데이터 없이 진행합니다: {}", e.getMessage());
            return Collections.emptyMap();
        }
    }

    private Map<String, GpsData> loadObjectiveGps() {
        try {
            ClassPathResource resource = new ClassPathResource("data/objective_gps.json");
            return objectMapper.readValue(resource.getInputStream(),
                    new TypeReference<Map<String, GpsData>>() {});
        } catch (IOException e) {
            log.warn("objective_gps.json 로딩 실패. 좌표 없이 진행합니다: {}", e.getMessage());
            return Collections.emptyMap();
        }
    }

    // ─── 내부 메타데이터 레코드 ───────────────────────────────────────────────

    record MapMetadata(String svgFile, String defaultFloor, Integer coordinateRotation,
                       List<FloorMetadata> floors, List<String> aliases) {
        MapMetadata() {
            this(null, null, 0, List.of(), List.of());
        }
    }

    record FloorMetadata(String floorId, String floorLabel, Integer floorOrder) {}

    record GpsData(String map, Double leftPercent, Double topPercent, String floor) {}
}
