package com.smartinventory.inventoryservice.dto;

import jakarta.validation.constraints.NotBlank;

public record StockAdjustmentRequest(int quantityDelta, @NotBlank String reason) {}

