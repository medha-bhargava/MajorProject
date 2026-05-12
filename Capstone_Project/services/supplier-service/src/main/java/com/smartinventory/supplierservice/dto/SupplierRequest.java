package com.smartinventory.supplierservice.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record SupplierRequest(@NotBlank String name, @Email @NotBlank String email, String phone, String contactPerson, @NotBlank String productCategory, @Min(1) Integer averageLeadTimeDays, @DecimalMin("0.0") @DecimalMax("5.0") BigDecimal rating) {}

