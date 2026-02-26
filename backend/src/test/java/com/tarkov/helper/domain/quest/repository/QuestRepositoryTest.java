package com.tarkov.helper.domain.quest.repository;

import com.tarkov.helper.domain.map.entity.GameMap;
import com.tarkov.helper.domain.map.repository.GameMapRepository;
import com.tarkov.helper.domain.quest.entity.Quest;
import com.tarkov.helper.domain.trader.entity.Trader;
import com.tarkov.helper.domain.trader.repository.TraderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class QuestRepositoryTest {

    @Autowired
    private QuestRepository questRepository;

    @Autowired
    private TraderRepository traderRepository;

    @Autowired
    private GameMapRepository gameMapRepository;

    private Trader prapor;
    private Trader therapist;
    private GameMap customs;
    private GameMap woods;

    @BeforeEach
    void setUp() {
        questRepository.deleteAll();
        traderRepository.deleteAll();
        gameMapRepository.deleteAll();

        prapor = traderRepository.save(Trader.builder().apiId("prapor").name("Prapor").build());
        therapist = traderRepository.save(Trader.builder().apiId("therapist").name("Therapist").build());
        customs = gameMapRepository.save(GameMap.builder()
                .apiId("customs").name("Customs").normalizedName("customs").build());
        woods = gameMapRepository.save(GameMap.builder()
                .apiId("woods").name("Woods").normalizedName("woods").build());

        questRepository.saveAll(List.of(
                Quest.builder().apiId("q1").name("Debut").trader(prapor).map(customs)
                        .kappaRequired(true).minPlayerLevel(1).removed(false).objectives(new ArrayList<>()).build(),
                Quest.builder().apiId("q2").name("Checking").trader(therapist).map(woods)
                        .kappaRequired(false).minPlayerLevel(5).removed(false).objectives(new ArrayList<>()).build(),
                Quest.builder().apiId("q3").name("Removed Quest").trader(prapor).map(customs)
                        .kappaRequired(true).minPlayerLevel(1).removed(true).objectives(new ArrayList<>()).build()
        ));
    }

    @Test
    @DisplayName("findByRemovedFalse: removed=false 퀘스트만 반환")
    void findByRemovedFalse() {
        List<Quest> quests = questRepository.findByRemovedFalse();

        assertThat(quests).hasSize(2);
        assertThat(quests).noneMatch(q -> Boolean.TRUE.equals(q.getRemoved()));
    }

    @Test
    @DisplayName("findWithFilters: 필터 없이 전체 조회")
    void findWithFiltersNoFilter() {
        List<Quest> quests = questRepository.findWithFilters(null, null, null);

        assertThat(quests).hasSize(2); // removed 제외
    }

    @Test
    @DisplayName("findWithFilters: 트레이더 필터")
    void findWithFiltersTrader() {
        List<Quest> quests = questRepository.findWithFilters(prapor.getId(), null, null);

        assertThat(quests).hasSize(1);
        assertThat(quests.get(0).getName()).isEqualTo("Debut");
    }

    @Test
    @DisplayName("findWithFilters: 카파 필터")
    void findWithFiltersKappa() {
        List<Quest> quests = questRepository.findWithFilters(null, true, null);

        assertThat(quests).hasSize(1);
        assertThat(quests.get(0).getKappaRequired()).isTrue();
    }

    @Test
    @DisplayName("findWithFilters: 맵 필터")
    void findWithFiltersMap() {
        List<Quest> quests = questRepository.findWithFilters(null, null, woods.getId());

        assertThat(quests).hasSize(1);
        assertThat(quests.get(0).getMap().getName()).isEqualTo("Woods");
    }

    @Test
    @DisplayName("findWithFilters: 복합 필터")
    void findWithFiltersCombined() {
        List<Quest> quests = questRepository.findWithFilters(prapor.getId(), true, customs.getId());

        assertThat(quests).hasSize(1);
        assertThat(quests.get(0).getName()).isEqualTo("Debut");
    }

    @Test
    @DisplayName("findByIdWithDetails: 존재하는 퀘스트")
    void findByIdWithDetails() {
        Quest debut = questRepository.findByRemovedFalse().stream()
                .filter(q -> q.getName().equals("Debut")).findFirst().orElseThrow();

        Optional<Quest> found = questRepository.findByIdWithDetails(debut.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getTrader().getName()).isEqualTo("Prapor");
    }

    @Test
    @DisplayName("findByIdWithDetails: removed 퀘스트는 조회 불가")
    void findByIdWithDetailsRemoved() {
        Quest removed = questRepository.findAll().stream()
                .filter(q -> Boolean.TRUE.equals(q.getRemoved())).findFirst().orElseThrow();

        Optional<Quest> found = questRepository.findByIdWithDetails(removed.getId());

        assertThat(found).isEmpty();
    }
}
