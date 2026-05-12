package com.smartinventory.authservice.service;

import com.smartinventory.authservice.domain.AppUser;
import com.smartinventory.authservice.domain.RefreshToken;
import com.smartinventory.authservice.dto.*;
import com.smartinventory.authservice.repository.AppUserRepository;
import com.smartinventory.authservice.repository.RefreshTokenRepository;
import com.smartinventory.authservice.security.JwtService;
import java.time.Instant;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final AppUserRepository users;
    private final RefreshTokenRepository refreshTokens;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final long refreshExpirationMs;

    public AuthService(AppUserRepository users, RefreshTokenRepository refreshTokens, PasswordEncoder passwordEncoder, JwtService jwtService,
                       @Value("${app.refresh-expiration-ms}") long refreshExpirationMs) {
        this.users = users;
        this.refreshTokens = refreshTokens;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (users.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email is already registered");
        }
        AppUser user = users.save(new AppUser(request.fullName(), request.email().toLowerCase(), passwordEncoder.encode(request.password()), request.role()));
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        AppUser user = users.findByEmail(request.email().toLowerCase()).orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        if (!user.isActive() || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken token = refreshTokens.findByToken(request.refreshToken()).orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));
        if (token.isRevoked() || token.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Refresh token expired or revoked");
        }
        token.revoke();
        return issueTokens(token.getUser());
    }

    public TokenValidationResponse validate(String bearerToken) {
        try {
            var claims = jwtService.parse(bearerToken.replace("Bearer ", ""));
            return new TokenValidationResponse(true, claims.getSubject(), String.valueOf(claims.get("role")));
        } catch (RuntimeException ex) {
            return new TokenValidationResponse(false, null, null);
        }
    }

    private AuthResponse issueTokens(AppUser user) {
        String accessToken = jwtService.createToken(user);
        String refreshToken = UUID.randomUUID().toString().replace("-", "");
        refreshTokens.save(new RefreshToken(refreshToken, user, Instant.now().plusMillis(refreshExpirationMs)));
        return new AuthResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole(), accessToken, refreshToken);
    }
}
