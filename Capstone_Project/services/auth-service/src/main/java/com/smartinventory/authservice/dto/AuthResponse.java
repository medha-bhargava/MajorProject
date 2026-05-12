package com.smartinventory.authservice.dto;

import com.smartinventory.authservice.domain.Role;
import java.util.UUID;

public record AuthResponse(UUID userId, String fullName, String email, Role role, String accessToken, String refreshToken) {}

