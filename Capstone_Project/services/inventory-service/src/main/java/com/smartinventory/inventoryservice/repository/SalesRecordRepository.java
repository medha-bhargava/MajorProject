package com.smartinventory.inventoryservice.repository;

import com.smartinventory.inventoryservice.domain.SalesRecord;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SalesRecordRepository extends JpaRepository<SalesRecord, UUID> {
 List<SalesRecord> findAllByOrderByCreatedAtDesc();
}
