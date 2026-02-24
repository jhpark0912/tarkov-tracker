package com.tarkov.helper.domain.auth.controller;

import com.tarkov.helper.domain.auth.dto.AuthResponse;
import com.tarkov.helper.domain.auth.dto.LoginRequest;
import com.tarkov.helper.domain.auth.dto.SignupRequest;
import com.tarkov.helper.domain.auth.dto.UserResponse;
import com.tarkov.helper.domain.auth.entity.User;
import com.tarkov.helper.domain.auth.service.AuthService;
import com.tarkov.helper.global.exception.UnauthorizedException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(@AuthenticationPrincipal User user) {
        if (user == null) {
            throw new UnauthorizedException("인증이 필요합니다");
        }
        return ResponseEntity.ok(UserResponse.from(user));
    }
}
