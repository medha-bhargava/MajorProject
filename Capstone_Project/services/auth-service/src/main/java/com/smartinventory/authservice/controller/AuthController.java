package com.smartinventory.authservice.controller;

import com.smartinventory.authservice.dto.*;
import com.smartinventory.authservice.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;
    public AuthController(AuthService authService) { this.authService = authService; }

    @PostMapping("/register")
    AuthResponse register(@Valid @RequestBody SignupRequest request) { return authService.signup(request); }

    @PostMapping("/login")
    AuthResponse login(@Valid @RequestBody LoginRequest request) { return authService.login(request); }

    @PostMapping("/refresh")
    AuthResponse refresh(@Valid @RequestBody RefreshTokenRequest request) { return authService.refresh(request); }

    @GetMapping("/validate")
    TokenValidationResponse validate(@RequestHeader(HttpHeaders.AUTHORIZATION) String token) { return authService.validate(token); }
}
