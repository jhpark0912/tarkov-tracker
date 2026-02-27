package com.tarkov.helper.domain.progress.dto;

import com.tarkov.helper.domain.progress.entity.UserKeyProgress;

import java.time.LocalDateTime;

public record KeyProgressResponse(
        String itemApiId,
        Boolean owned,
        LocalDateTime updatedAt
) {
    public static KeyProgressResponse from(UserKeyProgress progress) {
        return new KeyProgressResponse(
                progress.getItemApiId(),
                progress.getOwned(),
                progress.getUpdatedAt()
        );
    }
}
