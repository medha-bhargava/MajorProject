package com.smartinventory.shipmentservice.dto;

import jakarta.validation.constraints.NotBlank;

public record ShipmentRequest(@NotBlank String trackingNumber,@NotBlank String carrier,@NotBlank String originWarehouse,@NotBlank String destinationWarehouse) {}

