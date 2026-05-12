package com.smartinventory.inventoryservice.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record InventoryItemResponse(UUID id,String sku,String name,String category,String warehouseCode,int quantity,int lowStockThreshold,BigDecimal unitCost,BigDecimal valuation,boolean lowStock,Instant updatedAt) {}

