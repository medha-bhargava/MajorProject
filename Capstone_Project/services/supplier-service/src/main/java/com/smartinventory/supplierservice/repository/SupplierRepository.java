package com.smartinventory.supplierservice.repository;

import com.smartinventory.supplierservice.domain.Supplier;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierRepository extends JpaRepository<Supplier, UUID> {}

