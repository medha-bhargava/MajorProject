package com.smartinventory.supplierservice.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record SupplierResponse(UUID id,String name,String email,String phone,String contactPerson,String productCategory,Integer averageLeadTimeDays,BigDecimal rating,Instant createdAt) {}

