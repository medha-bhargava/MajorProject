package com.smartinventory.inventoryservice.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record InventoryItemRequest(@NotBlank String sku,@NotBlank String name,String category,@NotBlank String warehouseCode,@Min(0) int quantity,@Min(0) int lowStockThreshold,@DecimalMin("0.0") BigDecimal unitCost) {}

