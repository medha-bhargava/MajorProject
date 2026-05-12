package com.smartinventory.shipmentservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import com.smartinventory.shipmentservice.domain.ShipmentStatus;
import org.junit.jupiter.api.Test;

class ShipmentServiceTest { @Test void deliveredStatusIsStable(){ assertEquals("DELIVERED", ShipmentStatus.DELIVERED.name()); } }

