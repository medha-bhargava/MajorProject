package com.smartinventory.userservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UserProfileRequest(@Email @NotBlank String email, @NotBlank String fullName, @NotBlank String role, String phone, String warehouseCode, String jobTitle) {}

