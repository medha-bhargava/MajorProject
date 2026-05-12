package com.smartinventory.orderservice.repository;

import com.smartinventory.orderservice.domain.PurchaseOrder;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, UUID> {}

