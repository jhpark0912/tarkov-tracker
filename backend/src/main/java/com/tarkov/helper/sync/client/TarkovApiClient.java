package com.tarkov.helper.sync.client;

import com.tarkov.helper.sync.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class TarkovApiClient {

    private final WebClient tarkovWebClient;

    private static final String ZONES_FRAGMENT = "zones { map { id } position { x y z } }";
    private static final String TASKS_QUERY = """
            {
              "query": "{ tasks { id name kappaRequired minPlayerLevel wikiLink taskImageLink experience trader { id name imageLink } map { id name normalizedName } taskRequirements { task { id } } objectives { id type description optional maps { id normalizedName } ... on TaskObjectiveBasic { %1$s } ... on TaskObjectiveItem { item { id name shortName iconLink wikiLink width height } items { id name shortName iconLink wikiLink width height } count foundInRaid %1$s } ... on TaskObjectiveMark { markerItem { id name shortName iconLink } %1$s } ... on TaskObjectiveShoot { %1$s } ... on TaskObjectiveQuestItem { %1$s } ... on TaskObjectiveUseItem { %1$s } } } }"
            }
            """.formatted(ZONES_FRAGMENT);

    private static final String MAPS_QUERY = """
            {
              "query": "{ maps { id name normalizedName extracts { id name faction position { x y z } top bottom } locks { lockType needsPower key { id name shortName iconLink } position { x y z } top bottom } bosses { name spawnChance spawnLocations { name chance } } lootContainers { position { x y z } lootContainer { name normalizedName } } } }"
            }
            """;

    public List<TarkovTaskDto> fetchTasks() {
        log.debug("tarkov.dev API - tasks 조회 시작");
        TarkovApiResponse<TarkovTasksData> response = tarkovWebClient.post()
                .bodyValue(TASKS_QUERY)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<TarkovApiResponse<TarkovTasksData>>() {})
                .block();

        if (response == null || response.getData() == null || response.getData().getTasks() == null) {
            log.warn("tarkov.dev API - tasks 응답 없음");
            return List.of();
        }

        List<TarkovTaskDto> tasks = response.getData().getTasks();
        log.debug("tarkov.dev API - tasks 조회 완료: {}건", tasks.size());
        return tasks;
    }

    public List<TarkovMapDto> fetchMaps() {
        log.debug("tarkov.dev API - maps 조회 시작");
        TarkovApiResponse<TarkovMapsData> response = tarkovWebClient.post()
                .bodyValue(MAPS_QUERY)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<TarkovApiResponse<TarkovMapsData>>() {})
                .block();

        if (response == null || response.getData() == null || response.getData().getMaps() == null) {
            log.warn("tarkov.dev API - maps 응답 없음");
            return List.of();
        }

        List<TarkovMapDto> maps = response.getData().getMaps();
        log.debug("tarkov.dev API - maps 조회 완료: {}건", maps.size());
        return maps;
    }
}
