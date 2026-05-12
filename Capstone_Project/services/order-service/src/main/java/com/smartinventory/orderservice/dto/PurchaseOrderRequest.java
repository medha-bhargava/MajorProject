package com.smartinventory.orderservice.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.UUID;

public record PurchaseOrderRequest(@NotBlank String sku,@NotBlank String itemName,@Min(1) int quantity,@NotNull UUID supplierId,@NotBlank String requestedBy,@DecimalMin("0.0") BigDecimal unitCost) {}

