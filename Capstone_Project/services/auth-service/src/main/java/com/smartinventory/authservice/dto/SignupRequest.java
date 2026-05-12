package com.smartinventory.authservice.dto;

import com.smartinventory.authservice.domain.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SignupRequest(
        @NotBlank String fullName,
        @Email @NotBlank String email,
        @Size(min = 8, max = 100) String password,
        @NotNull Role role) {}

