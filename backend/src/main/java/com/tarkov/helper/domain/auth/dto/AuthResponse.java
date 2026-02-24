package com.tarkov.helper.domain.auth.dto;

import com.tarkov.helper.domain.auth.entity.User;

public record AuthResponse(
        String token,
        UserResponse user
) {
    public static AuthResponse of(String token, User user) {
        return new AuthResponse(token, UserResponse.from(user));
    }
}
