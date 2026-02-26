package com.tarkov.helper.global.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtTokenProviderTest {

    private JwtTokenProvider tokenProvider;

    private static final String SECRET = "test-jwt-secret-key-must-be-at-least-32-characters-long-for-hmac-sha256";
    private static final long EXPIRATION = 3600000L; // 1시간

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider(SECRET, EXPIRATION);
    }

    @Test
    @DisplayName("토큰 생성 + 파싱 왕복 테스트")
    void generateAndParse() {
        Long userId = 42L;

        String token = tokenProvider.generateToken(userId);

        assertThat(token).isNotBlank();
        assertThat(tokenProvider.validateToken(token)).isTrue();
        assertThat(tokenProvider.getUserIdFromToken(token)).isEqualTo(userId);
    }

    @Test
    @DisplayName("다른 userId로 생성한 토큰은 다른 값 반환")
    void differentUserIds() {
        String token1 = tokenProvider.generateToken(1L);
        String token2 = tokenProvider.generateToken(2L);

        assertThat(tokenProvider.getUserIdFromToken(token1)).isEqualTo(1L);
        assertThat(tokenProvider.getUserIdFromToken(token2)).isEqualTo(2L);
        assertThat(token1).isNotEqualTo(token2);
    }

    @Test
    @DisplayName("만료된 토큰은 validateToken false 반환")
    void expiredToken() {
        // expiration을 0으로 설정하여 즉시 만료되는 토큰 생성
        JwtTokenProvider expiredProvider = new JwtTokenProvider(SECRET, 0L);
        String token = expiredProvider.generateToken(1L);

        assertThat(expiredProvider.validateToken(token)).isFalse();
    }

    @Test
    @DisplayName("변조된 토큰은 validateToken false 반환")
    void tamperedToken() {
        String token = tokenProvider.generateToken(1L);
        String tampered = token.substring(0, token.length() - 5) + "xxxxx";

        assertThat(tokenProvider.validateToken(tampered)).isFalse();
    }

    @Test
    @DisplayName("잘못된 형식의 토큰은 validateToken false 반환")
    void malformedToken() {
        assertThat(tokenProvider.validateToken("not.a.valid.jwt.token")).isFalse();
    }

    @Test
    @DisplayName("다른 시크릿키로 생성된 토큰은 validateToken false 반환")
    void differentSecret() {
        JwtTokenProvider otherProvider = new JwtTokenProvider(
                "another-secret-key-that-is-also-at-least-32-characters-long-for-hmac", EXPIRATION);
        String token = otherProvider.generateToken(1L);

        assertThat(tokenProvider.validateToken(token)).isFalse();
    }

    @Test
    @DisplayName("유효하지 않은 토큰으로 getUserIdFromToken 호출 시 예외 발생")
    void invalidTokenGetUserId() {
        assertThatThrownBy(() -> tokenProvider.getUserIdFromToken("invalid.token.value"))
                .isInstanceOf(Exception.class);
    }
}
