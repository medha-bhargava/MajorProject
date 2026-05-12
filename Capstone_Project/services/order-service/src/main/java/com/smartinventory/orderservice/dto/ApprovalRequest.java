package com.smartinventory.orderservice.dto;

import jakarta.validation.constraints.NotBlank;

public record ApprovalRequest(@NotBlank String approver) {}

