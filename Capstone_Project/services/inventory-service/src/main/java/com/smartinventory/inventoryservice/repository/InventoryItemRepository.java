package com.smartinventory.inventoryservice.repository;

import com.smartinventory.inventoryservice.domain.InventoryItem;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, UUID> {
 Page<InventoryItem> findByNameContainingIgnoreCaseOrSkuContainingIgnoreCase(String name,String sku,Pageable pageable);
}
