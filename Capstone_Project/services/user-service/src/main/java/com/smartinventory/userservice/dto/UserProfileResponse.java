package com.smartinventory.userservice.dto;

import java.time.Instant;
import java.util.UUID;

public record UserProfileResponse(UUID id, String email, String fullName, String role, String phone, String warehouseCode, String jobTitle, Instant createdAt) {}

