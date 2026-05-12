package com.smartinventory.authservice.dto;

public record TokenValidationResponse(boolean valid, String subject, String role) {}

