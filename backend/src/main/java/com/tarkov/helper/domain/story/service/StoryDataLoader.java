package com.tarkov.helper.domain.story.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tarkov.helper.domain.story.dto.StoryChapterResponse;
import com.tarkov.helper.domain.story.dto.StoryEndingResponse;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;

@Slf4j
@Component
public class StoryDataLoader {

    private List<StoryChapterResponse> chapters = Collections.emptyList();
    private List<StoryEndingResponse> endings = Collections.emptyList();
    private final Set<String> validChapterIds = new HashSet<>();

    @PostConstruct
    public void load() {
        ObjectMapper mapper = new ObjectMapper();
        try (InputStream is = new ClassPathResource("data/story-chapters.json").getInputStream()) {
            JsonNode root = mapper.readTree(is);

            chapters = parseChapters(root.get("chapters"));
            endings = parseEndings(root.get("endings"));

            chapters.forEach(ch -> validChapterIds.add(ch.getId()));

            log.debug("스토리 데이터 로딩 완료: 챕터 {}개, 엔딩 {}개", chapters.size(), endings.size());
        } catch (IOException e) {
            log.error("스토리 데이터 로딩 실패", e);
        }
    }

    public List<StoryChapterResponse> getChapters() {
        return chapters;
    }

    public List<StoryEndingResponse> getEndings() {
        return endings;
    }

    public boolean isValidChapterId(String chapterId) {
        return validChapterIds.contains(chapterId);
    }

    private List<StoryChapterResponse> parseChapters(JsonNode chaptersNode) {
        if (chaptersNode == null || !chaptersNode.isArray()) return Collections.emptyList();

        List<StoryChapterResponse> result = new ArrayList<>();
        for (JsonNode node : chaptersNode) {
            List<StoryChapterResponse.ChoiceDto> choices = new ArrayList<>();
            JsonNode choicesNode = node.get("choices");
            if (choicesNode != null && choicesNode.isArray()) {
                for (JsonNode cn : choicesNode) {
                    choices.add(StoryChapterResponse.ChoiceDto.builder()
                            .id(cn.get("id").asText())
                            .label(cn.get("label").asText())
                            .description(cn.get("description").asText())
                            .nextChapterId(cn.get("nextChapterId").asText())
                            .build());
                }
            }

            List<String> maps = new ArrayList<>();
            JsonNode mapsNode = node.get("maps");
            if (mapsNode != null && mapsNode.isArray()) {
                for (JsonNode m : mapsNode) {
                    maps.add(m.asText());
                }
            }

            result.add(StoryChapterResponse.builder()
                    .id(node.get("id").asText())
                    .name(node.get("name").asText())
                    .description(node.get("description").asText())
                    .maps(maps)
                    .nextChapterId(node.has("nextChapterId") && !node.get("nextChapterId").isNull()
                            ? node.get("nextChapterId").asText() : null)
                    .choices(choices)
                    .column(node.get("column").asInt())
                    .row(node.get("row").asInt())
                    .build());
        }
        return Collections.unmodifiableList(result);
    }

    private List<StoryEndingResponse> parseEndings(JsonNode endingsNode) {
        if (endingsNode == null || !endingsNode.isArray()) return Collections.emptyList();

        List<StoryEndingResponse> result = new ArrayList<>();
        for (JsonNode node : endingsNode) {
            result.add(StoryEndingResponse.builder()
                    .id(node.get("id").asText())
                    .name(node.get("name").asText())
                    .subtitle(node.get("subtitle").asText())
                    .description(node.get("description").asText())
                    .color(node.get("color").asText())
                    .column(node.get("column").asInt())
                    .row(node.get("row").asInt())
                    .build());
        }
        return Collections.unmodifiableList(result);
    }
}
