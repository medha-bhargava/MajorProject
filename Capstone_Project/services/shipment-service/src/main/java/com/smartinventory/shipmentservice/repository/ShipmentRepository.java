package com.smartinventory.shipmentservice.repository;

import com.smartinventory.shipmentservice.domain.Shipment;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShipmentRepository extends JpaRepository<Shipment, UUID> {}

