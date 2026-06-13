package com.smartinventory.inventoryservice.dto;

import com.smartinventory.inventoryservice.domain.SalesStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record SalesRecordResponse(UUID id,String sku,String itemName,int quantity,BigDecimal unitCost,SalesStatus status,Instant createdAt) {}
