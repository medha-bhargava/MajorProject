package com.smartinventory.shipmentservice.dto;

import com.smartinventory.shipmentservice.domain.ShipmentStatus;
import java.time.Instant;
import java.util.UUID;

public record ShipmentResponse(UUID id,String trackingNumber,String carrier,String originWarehouse,String destinationWarehouse,ShipmentStatus status,Instant shippedAt,Instant deliveredAt,Instant createdAt) {}

