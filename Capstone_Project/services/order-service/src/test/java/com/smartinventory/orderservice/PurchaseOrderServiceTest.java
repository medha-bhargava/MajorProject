package com.smartinventory.orderservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import com.smartinventory.orderservice.domain.OrderStatus;
import org.junit.jupiter.api.Test;

class PurchaseOrderServiceTest { @Test void approvalStatusIsStable(){ assertEquals(OrderStatus.APPROVED.name(), "APPROVED"); } }

