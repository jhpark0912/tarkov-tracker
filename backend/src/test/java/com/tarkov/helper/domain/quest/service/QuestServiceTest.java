package com.tarkov.helper.domain.quest.service;

import com.tarkov.helper.domain.map.entity.GameMap;
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
import com.tarkov.helper.domain.trader.entity.Trader;
import com.tarkov.helper.domain.trader.repository.TraderRepository;
import com.tarkov.helper.global.exception.ResourceNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class QuestServiceTest {

    @Mock
    private QuestRepository questRepository;

    @Mock
    private QuestObjectiveRepository questObjectiveRepository;

    @Mock
    private QuestPrerequisiteRepository questPrerequisiteRepository;

    @Mock
    private TraderRepository traderRepository;

    @Mock
    private GameMapRepository gameMapRepository;

    @InjectMocks
    private QuestService questService;

    private Trader createTrader(Long id, String name) {
        return Trader.builder().id(id).apiId("trader-" + id).name(name).build();
    }

    private GameMap createMap(Long id, String name, String normalizedName) {
        return GameMap.builder().id(id).apiId("map-" + id).name(name).normalizedName(normalizedName).build();
    }

    private Quest createQuest(Long id, String name, Trader trader, GameMap map, boolean kappa) {
        return Quest.builder()
                .id(id).apiId("quest-" + id).name(name)
                .trader(trader).map(map)
                .kappaRequired(kappa).minPlayerLevel(1)
                .removed(false)
                .objectives(new ArrayList<>())
                .build();
    }

    @Nested
    @DisplayName("getQuestList")
    class GetQuestList {

        @Test
        @DisplayName("필터 없이 전체 조회")
        void noFilter() {
            Trader trader = createTrader(1L, "Prapor");
            GameMap map = createMap(1L, "Customs", "customs");
            Quest quest = createQuest(1L, "Debut", trader, map, true);

            given(questRepository.findWithFilters(null, null, null))
                    .willReturn(List.of(quest));

            List<QuestListItem> result = questService.getQuestList(null, null, null);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getName()).isEqualTo("Debut");
        }

        @Test
        @DisplayName("트레이더 이름으로 필터")
        void filterByTrader() {
            Trader prapor = createTrader(1L, "Prapor");
            given(traderRepository.findAll()).willReturn(List.of(prapor));
            given(questRepository.findWithFilters(1L, null, null))
                    .willReturn(List.of(createQuest(1L, "Debut", prapor, null, false)));

            List<QuestListItem> result = questService.getQuestList("Prapor", null, null);

            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("카파 필터")
        void filterByKappa() {
            given(questRepository.findWithFilters(null, true, null))
                    .willReturn(List.of(createQuest(1L, "KappaQuest", null, null, true)));

            List<QuestListItem> result = questService.getQuestList(null, true, null);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getKappaRequired()).isTrue();
        }

        @Test
        @DisplayName("맵 이름으로 필터")
        void filterByMap() {
            GameMap customs = createMap(1L, "Customs", "customs");
            given(gameMapRepository.findByNormalizedName("customs")).willReturn(Optional.of(customs));
            given(questRepository.findWithFilters(null, null, 1L))
                    .willReturn(List.of(createQuest(1L, "Debut", null, customs, false)));

            List<QuestListItem> result = questService.getQuestList(null, null, "customs");

            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("존재하지 않는 트레이더 필터 시 빈 결과")
        void filterByNonExistentTrader() {
            given(traderRepository.findAll()).willReturn(List.of());
            given(questRepository.findWithFilters(null, null, null))
                    .willReturn(List.of());

            List<QuestListItem> result = questService.getQuestList("NonExistent", null, null);

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("getQuestDetail")
    class GetQuestDetail {

        @Test
        @DisplayName("존재하는 퀘스트 상세 조회")
        void questDetailSuccess() {
            Trader trader = createTrader(1L, "Prapor");
            Quest quest = createQuest(1L, "Debut", trader, null, true);

            given(questRepository.findByIdWithDetails(1L)).willReturn(Optional.of(quest));
            given(questObjectiveRepository.findByQuestWithItems(quest)).willReturn(List.of());
            given(questPrerequisiteRepository.findByQuestWithPrereqs(quest)).willReturn(List.of());

            QuestDetail detail = questService.getQuestDetail(1L);

            assertThat(detail.getName()).isEqualTo("Debut");
            assertThat(detail.getKappaRequired()).isTrue();
        }

        @Test
        @DisplayName("존재하지 않는 퀘스트 조회 시 ResourceNotFoundException 발생")
        void questDetailNotFound() {
            given(questRepository.findByIdWithDetails(999L)).willReturn(Optional.empty());

            assertThatThrownBy(() -> questService.getQuestDetail(999L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("getMapMarkers")
    class GetMapMarkers {

        @Test
        @DisplayName("맵 마커 조회 - floorId 필터 없이")
        void markersNoFloorFilter() {
            Trader trader = createTrader(1L, "Prapor");
            Quest quest = createQuest(1L, "Debut", trader, null, false);
            QuestObjective objective = QuestObjective.builder()
                    .id(1L).apiId("obj-1").quest(quest)
                    .type("visit").description("Go to location")
                    .floorId("Ground").positionX(50.0).positionY(50.0)
                    .requiredItems(new ArrayList<>())
                    .build();

            given(questObjectiveRepository.findMapMarkersForMap(1L)).willReturn(List.of(objective));

            List<QuestMapMarker> markers = questService.getMapMarkers(1L, null);

            assertThat(markers).hasSize(1);
            assertThat(markers.get(0).getQuestName()).isEqualTo("Debut");
        }

        @Test
        @DisplayName("맵 마커 조회 - floorId 필터 적용")
        void markersWithFloorFilter() {
            Trader trader = createTrader(1L, "Prapor");
            Quest quest = createQuest(1L, "Debut", trader, null, false);
            QuestObjective ground = QuestObjective.builder()
                    .id(1L).apiId("obj-1").quest(quest)
                    .type("visit").description("Ground task")
                    .floorId("Ground").positionX(50.0).positionY(50.0)
                    .requiredItems(new ArrayList<>())
                    .build();
            QuestObjective basement = QuestObjective.builder()
                    .id(2L).apiId("obj-2").quest(quest)
                    .type("visit").description("Basement task")
                    .floorId("Basement").positionX(30.0).positionY(30.0)
                    .requiredItems(new ArrayList<>())
                    .build();

            given(questObjectiveRepository.findMapMarkersForMap(1L)).willReturn(List.of(ground, basement));

            List<QuestMapMarker> markers = questService.getMapMarkers(1L, "Ground");

            assertThat(markers).hasSize(1);
            assertThat(markers.get(0).getFloorId()).isEqualTo("Ground");
        }
    }
}
