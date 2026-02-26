package com.tarkov.helper.domain.auth.service;

import com.tarkov.helper.domain.auth.dto.AuthResponse;
import com.tarkov.helper.domain.auth.dto.LoginRequest;
import com.tarkov.helper.domain.auth.dto.SignupRequest;
import com.tarkov.helper.domain.auth.dto.UserResponse;
import com.tarkov.helper.domain.auth.entity.User;
import com.tarkov.helper.domain.auth.repository.UserRepository;
import com.tarkov.helper.global.auth.JwtTokenProvider;
import com.tarkov.helper.global.exception.DuplicateResourceException;
import com.tarkov.helper.global.exception.ResourceNotFoundException;
import com.tarkov.helper.global.exception.UnauthorizedException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    private User createUser(Long id, String username, String email) {
        return User.builder()
                .id(id)
                .username(username)
                .email(email)
                .password("encodedPassword")
                .build();
    }

    @Nested
    @DisplayName("signup")
    class Signup {

        @Test
        @DisplayName("정상 회원가입 시 AuthResponse 반환")
        void signupSuccess() {
            SignupRequest request = new SignupRequest("testuser", "test@mail.com", "password123");
            User savedUser = createUser(1L, "testuser", "test@mail.com");

            given(userRepository.existsByEmail("test@mail.com")).willReturn(false);
            given(userRepository.existsByUsername("testuser")).willReturn(false);
            given(passwordEncoder.encode("password123")).willReturn("encodedPassword");
            given(userRepository.save(any(User.class))).willReturn(savedUser);
            given(jwtTokenProvider.generateToken(1L)).willReturn("jwt-token");

            AuthResponse response = authService.signup(request);

            assertThat(response.token()).isEqualTo("jwt-token");
            assertThat(response.user().username()).isEqualTo("testuser");
            assertThat(response.user().email()).isEqualTo("test@mail.com");
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("이메일 중복 시 DuplicateResourceException 발생")
        void signupDuplicateEmail() {
            SignupRequest request = new SignupRequest("testuser", "dup@mail.com", "password123");
            given(userRepository.existsByEmail("dup@mail.com")).willReturn(true);

            assertThatThrownBy(() -> authService.signup(request))
                    .isInstanceOf(DuplicateResourceException.class);
        }

        @Test
        @DisplayName("사용자명 중복 시 DuplicateResourceException 발생")
        void signupDuplicateUsername() {
            SignupRequest request = new SignupRequest("dupuser", "new@mail.com", "password123");
            given(userRepository.existsByEmail("new@mail.com")).willReturn(false);
            given(userRepository.existsByUsername("dupuser")).willReturn(true);

            assertThatThrownBy(() -> authService.signup(request))
                    .isInstanceOf(DuplicateResourceException.class);
        }
    }

    @Nested
    @DisplayName("login")
    class Login {

        @Test
        @DisplayName("정상 로그인 시 AuthResponse 반환")
        void loginSuccess() {
            LoginRequest request = new LoginRequest("test@mail.com", "password123");
            User user = createUser(1L, "testuser", "test@mail.com");

            given(userRepository.findByEmail("test@mail.com")).willReturn(Optional.of(user));
            given(passwordEncoder.matches("password123", "encodedPassword")).willReturn(true);
            given(jwtTokenProvider.generateToken(1L)).willReturn("jwt-token");

            AuthResponse response = authService.login(request);

            assertThat(response.token()).isEqualTo("jwt-token");
            assertThat(response.user().email()).isEqualTo("test@mail.com");
        }

        @Test
        @DisplayName("존재하지 않는 이메일로 로그인 시 UnauthorizedException 발생")
        void loginEmailNotFound() {
            LoginRequest request = new LoginRequest("no@mail.com", "password123");
            given(userRepository.findByEmail("no@mail.com")).willReturn(Optional.empty());

            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(UnauthorizedException.class);
        }

        @Test
        @DisplayName("비밀번호 불일치 시 UnauthorizedException 발생")
        void loginWrongPassword() {
            LoginRequest request = new LoginRequest("test@mail.com", "wrong");
            User user = createUser(1L, "testuser", "test@mail.com");

            given(userRepository.findByEmail("test@mail.com")).willReturn(Optional.of(user));
            given(passwordEncoder.matches("wrong", "encodedPassword")).willReturn(false);

            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(UnauthorizedException.class);
        }
    }

    @Nested
    @DisplayName("getUserById")
    class GetUserById {

        @Test
        @DisplayName("존재하는 사용자 조회 시 UserResponse 반환")
        void getUserByIdSuccess() {
            User user = createUser(1L, "testuser", "test@mail.com");
            given(userRepository.findById(1L)).willReturn(Optional.of(user));

            UserResponse response = authService.getUserById(1L);

            assertThat(response.id()).isEqualTo(1L);
            assertThat(response.username()).isEqualTo("testuser");
        }

        @Test
        @DisplayName("존재하지 않는 사용자 조회 시 ResourceNotFoundException 발생")
        void getUserByIdNotFound() {
            given(userRepository.findById(999L)).willReturn(Optional.empty());

            assertThatThrownBy(() -> authService.getUserById(999L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}
