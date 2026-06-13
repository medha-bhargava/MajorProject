package com.smartinventory.inventoryservice.dto;

import com.smartinventory.inventoryservice.domain.SalesStatus;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record SalesRecordRequest(@NotBlank String sku,@NotBlank String itemName,@Min(1) int quantity,@NotNull @DecimalMin("0.0") BigDecimal unitCost,@NotNull SalesStatus status) {}
