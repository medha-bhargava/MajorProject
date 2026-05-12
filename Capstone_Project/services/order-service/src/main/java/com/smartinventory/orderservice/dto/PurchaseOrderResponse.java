package com.smartinventory.orderservice.dto;

import com.smartinventory.orderservice.domain.OrderStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PurchaseOrderResponse(UUID id,String sku,String itemName,int quantity,UUID supplierId,String requestedBy,OrderStatus status,BigDecimal unitCost,String approver,Instant approvedAt,Instant completedAt,Instant createdAt) {}

