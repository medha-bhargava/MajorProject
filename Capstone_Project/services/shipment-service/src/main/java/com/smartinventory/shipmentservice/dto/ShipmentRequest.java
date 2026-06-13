package com.smartinventory.shipmentservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public record ShipmentRequest(@NotBlank String trackingNumber,@NotBlank String carrier,@NotBlank String originWarehouse,@NotBlank String destinationWarehouse,@NotBlank String sku,@Min(1) Integer quantity,UUID orderId) {}
