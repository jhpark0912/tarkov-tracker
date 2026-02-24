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
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("이미 사용 중인 이메일입니다");
        }
        if (userRepository.existsByUsername(request.username())) {
            throw new DuplicateResourceException("이미 사용 중인 사용자 이름입니다");
        }

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .build();

        User savedUser = userRepository.save(user);
        String token = jwtTokenProvider.generateToken(savedUser.getId());
        return AuthResponse.of(token, savedUser);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UnauthorizedException("이메일 또는 비밀번호가 올바르지 않습니다"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new UnauthorizedException("이메일 또는 비밀번호가 올바르지 않습니다");
        }

        String token = jwtTokenProvider.generateToken(user.getId());
        return AuthResponse.of(token, user);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다"));
        return UserResponse.from(user);
    }
}
