package com.tarkov.helper.domain.auth.dto;

import com.tarkov.helper.domain.auth.entity.User;

public record UserResponse(
        Long id,
        String username,
        String email
) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getUsername(), user.getEmail());
    }
}
