package com.smartinventory.inventoryservice.repository;

import com.smartinventory.inventoryservice.domain.StockMovement;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockMovementRepository extends JpaRepository<StockMovement, UUID> { List<StockMovement> findByItemIdOrderByCreatedAtDesc(UUID itemId); }

