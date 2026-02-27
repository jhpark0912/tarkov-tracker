package com.tarkov.helper.domain.progress.service;

import com.tarkov.helper.domain.auth.entity.User;
import com.tarkov.helper.domain.map.entity.GameMap;
import com.tarkov.helper.domain.progress.dto.ItemProgressResponse;
import com.tarkov.helper.domain.progress.dto.ProgressSummaryResponse;
import com.tarkov.helper.domain.progress.dto.QuestProgressResponse;
import com.tarkov.helper.domain.progress.dto.UserProgressResponse;
import com.tarkov.helper.domain.progress.entity.UserItemProgress;
import com.tarkov.helper.domain.progress.entity.UserQuestProgress;
import com.tarkov.helper.domain.progress.entity.UserQuestProgress.QuestStatus;
import com.tarkov.helper.domain.progress.repository.UserHideoutItemProgressRepository;
import com.tarkov.helper.domain.progress.repository.UserHideoutProgressRepository;
import com.tarkov.helper.domain.progress.repository.UserItemProgressRepository;
import com.tarkov.helper.domain.progress.repository.UserKeyProgressRepository;
import com.tarkov.helper.domain.progress.repository.UserQuestProgressRepository;
import com.tarkov.helper.domain.quest.entity.Quest;
import com.tarkov.helper.domain.quest.entity.QuestObjective;
import com.tarkov.helper.domain.quest.repository.QuestObjectiveRepository;
import com.tarkov.helper.domain.quest.repository.QuestRepository;
import com.tarkov.helper.domain.trader.entity.Trader;
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
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ProgressServiceTest {

    @Mock
    private UserQuestProgressRepository questProgressRepo;

    @Mock
    private UserItemProgressRepository itemProgressRepo;

    @Mock
    private UserKeyProgressRepository keyProgressRepo;

    @Mock
    private UserHideoutProgressRepository hideoutProgressRepo;

    @Mock
    private UserHideoutItemProgressRepository hideoutItemProgressRepo;

    @Mock
    private QuestRepository questRepository;

    @Mock
    private QuestObjectiveRepository objectiveRepository;

    @InjectMocks
    private ProgressService progressService;

    private User createUser(Long id) {
        return User.builder().id(id).username("user" + id).email("user" + id + "@mail.com").password("pw").build();
    }

    private Trader createTrader(Long id, String name) {
        return Trader.builder().id(id).apiId("t-" + id).name(name).build();
    }

    private Quest createQuest(Long id, String name, Trader trader, GameMap map, boolean kappa) {
        return Quest.builder()
                .id(id).apiId("q-" + id).name(name)
                .trader(trader).map(map)
                .kappaRequired(kappa).minPlayerLevel(1)
                .removed(false).objectives(new ArrayList<>())
                .build();
    }

    @Nested
    @DisplayName("getUserProgress")
    class GetUserProgress {

        @Test
        @DisplayName("진행 상태가 있는 사용자")
        void withProgress() {
            Quest quest = createQuest(10L, "TestQuest", null, null, false);
            QuestObjective obj = QuestObjective.builder()
                    .id(20L).apiId("obj-1").quest(quest)
                    .type("collect").description("desc")
                    .requiredItems(new ArrayList<>())
                    .build();
            User user = createUser(1L);

            UserQuestProgress qp = UserQuestProgress.builder()
                    .id(1L).user(user).quest(quest).status(QuestStatus.COMPLETED).build();
            UserItemProgress ip = UserItemProgress.builder()
                    .id(1L).user(user).objective(obj).collectedCount(3).build();

            given(questProgressRepo.findAllByUserId(1L)).willReturn(List.of(qp));
            given(itemProgressRepo.findAllByUserId(1L)).willReturn(List.of(ip));

            UserProgressResponse response = progressService.getUserProgress(1L);

            assertThat(response.questStatuses()).containsEntry(10L, QuestStatus.COMPLETED);
            assertThat(response.itemCollectedCounts()).containsEntry(20L, 3);
        }

        @Test
        @DisplayName("진행 상태가 없는 사용자")
        void noProgress() {
            given(questProgressRepo.findAllByUserId(1L)).willReturn(List.of());
            given(itemProgressRepo.findAllByUserId(1L)).willReturn(List.of());

            UserProgressResponse response = progressService.getUserProgress(1L);

            assertThat(response.questStatuses()).isEmpty();
            assertThat(response.itemCollectedCounts()).isEmpty();
        }
    }

    @Nested
    @DisplayName("getProgressSummary")
    class GetProgressSummary {

        @Test
        @DisplayName("전체 통계 계산")
        void summaryStats() {
            Trader prapor = createTrader(1L, "Prapor");
            GameMap customs = GameMap.builder().id(1L).apiId("m-1").name("Customs").normalizedName("customs").build();

            Quest q1 = createQuest(1L, "Quest1", prapor, customs, true);
            Quest q2 = createQuest(2L, "Quest2", prapor, customs, false);
            Quest q3 = createQuest(3L, "Quest3", prapor, null, true);

            given(questRepository.findByRemovedFalse()).willReturn(List.of(q1, q2, q3));

            User user = createUser(1L);
            UserQuestProgress completed = UserQuestProgress.builder()
                    .id(1L).user(user).quest(q1).status(QuestStatus.COMPLETED).build();
            given(questProgressRepo.findAllByUserId(1L)).willReturn(List.of(completed));

            ProgressSummaryResponse summary = progressService.getProgressSummary(1L);

            assertThat(summary.totalQuests()).isEqualTo(3);
            assertThat(summary.completedQuests()).isEqualTo(1);
            assertThat(summary.kappaQuests().total()).isEqualTo(2);
            assertThat(summary.kappaQuests().completed()).isEqualTo(1);
            assertThat(summary.byTrader()).hasSize(1);
            assertThat(summary.byTrader().get(0).traderName()).isEqualTo("Prapor");
            assertThat(summary.byMap()).hasSize(1);
            assertThat(summary.byMap().get(0).mapName()).isEqualTo("Customs");
        }
    }

    @Nested
    @DisplayName("updateQuestProgress")
    class UpdateQuestProgress {

        @Test
        @DisplayName("새 진행 상태 생성")
        void createNew() {
            User user = createUser(1L);
            Quest quest = createQuest(10L, "Debut", null, null, false);

            given(questRepository.findByIdWithDetails(10L)).willReturn(Optional.of(quest));
            given(questProgressRepo.findByUserIdAndQuestId(1L, 10L)).willReturn(Optional.empty());
            given(questProgressRepo.save(any(UserQuestProgress.class)))
                    .willAnswer(inv -> {
                        UserQuestProgress p = inv.getArgument(0);
                        return UserQuestProgress.builder()
                                .id(1L).user(p.getUser()).quest(p.getQuest()).status(p.getStatus()).build();
                    });

            QuestProgressResponse response = progressService.updateQuestProgress(user, 10L, QuestStatus.IN_PROGRESS);

            assertThat(response.questId()).isEqualTo(10L);
            assertThat(response.status()).isEqualTo(QuestStatus.IN_PROGRESS);
        }

        @Test
        @DisplayName("기존 진행 상태 수정")
        void updateExisting() {
            User user = createUser(1L);
            Quest quest = createQuest(10L, "Debut", null, null, false);
            UserQuestProgress existing = UserQuestProgress.builder()
                    .id(1L).user(user).quest(quest).status(QuestStatus.IN_PROGRESS).build();

            given(questRepository.findByIdWithDetails(10L)).willReturn(Optional.of(quest));
            given(questProgressRepo.findByUserIdAndQuestId(1L, 10L)).willReturn(Optional.of(existing));
            given(questProgressRepo.save(any(UserQuestProgress.class))).willReturn(existing);

            QuestProgressResponse response = progressService.updateQuestProgress(user, 10L, QuestStatus.COMPLETED);

            assertThat(response.status()).isEqualTo(QuestStatus.COMPLETED);
        }

        @Test
        @DisplayName("존재하지 않는 퀘스트 시 ResourceNotFoundException")
        void questNotFound() {
            User user = createUser(1L);
            given(questRepository.findByIdWithDetails(999L)).willReturn(Optional.empty());

            assertThatThrownBy(() -> progressService.updateQuestProgress(user, 999L, QuestStatus.COMPLETED))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("updateItemProgress")
    class UpdateItemProgress {

        @Test
        @DisplayName("아이템 수집 수량 생성")
        void createItemProgress() {
            User user = createUser(1L);
            Quest quest = createQuest(10L, "Debut", null, null, false);
            QuestObjective obj = QuestObjective.builder()
                    .id(20L).apiId("obj-1").quest(quest)
                    .type("collect").description("desc")
                    .requiredItems(new ArrayList<>())
                    .build();

            given(objectiveRepository.findById(20L)).willReturn(Optional.of(obj));
            given(itemProgressRepo.findByUserIdAndObjectiveId(1L, 20L)).willReturn(Optional.empty());
            given(itemProgressRepo.save(any(UserItemProgress.class)))
                    .willAnswer(inv -> {
                        UserItemProgress p = inv.getArgument(0);
                        return UserItemProgress.builder()
                                .id(1L).user(p.getUser()).objective(p.getObjective())
                                .collectedCount(p.getCollectedCount()).build();
                    });

            ItemProgressResponse response = progressService.updateItemProgress(user, 20L, 5);

            assertThat(response.objectiveId()).isEqualTo(20L);
            assertThat(response.collectedCount()).isEqualTo(5);
        }

        @Test
        @DisplayName("존재하지 않는 목표 시 ResourceNotFoundException")
        void objectiveNotFound() {
            User user = createUser(1L);
            given(objectiveRepository.findById(999L)).willReturn(Optional.empty());

            assertThatThrownBy(() -> progressService.updateItemProgress(user, 999L, 1))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("resetProgress")
    class ResetProgress {

        @Test
        @DisplayName("전체 진행 초기화")
        void resetAll() {
            progressService.resetProgress(1L);

            verify(itemProgressRepo).deleteAllByUserId(1L);
            verify(questProgressRepo).deleteAllByUserId(1L);
            verify(keyProgressRepo).deleteAllByUserId(1L);
            verify(hideoutItemProgressRepo).deleteAllByUserId(1L);
            verify(hideoutProgressRepo).deleteAllByUserId(1L);
        }
    }
}
