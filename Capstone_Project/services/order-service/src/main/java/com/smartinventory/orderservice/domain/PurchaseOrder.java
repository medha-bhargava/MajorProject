package com.smartinventory.orderservice.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name="purchase_orders")
public class PurchaseOrder {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
 @Column(nullable=false) private String sku; @Column(nullable=false) private String itemName; @Column(nullable=false) private int quantity;
 @Column(nullable=false) private UUID supplierId; @Column(nullable=false) private String requestedBy;
 @Enumerated(EnumType.STRING) @Column(nullable=false) private OrderStatus status=OrderStatus.PENDING;
 @Column(precision=12,scale=2) private BigDecimal unitCost; private String approver; private Instant approvedAt; private Instant completedAt;
 @Column(nullable=false,updatable=false) private Instant createdAt=Instant.now();
 protected PurchaseOrder() {}
 public PurchaseOrder(String sku,String itemName,int quantity,UUID supplierId,String requestedBy,BigDecimal unitCost){this.sku=sku;this.itemName=itemName;this.quantity=quantity;this.supplierId=supplierId;this.requestedBy=requestedBy;this.unitCost=unitCost;}
 public UUID getId(){return id;} public String getSku(){return sku;} public String getItemName(){return itemName;} public int getQuantity(){return quantity;} public UUID getSupplierId(){return supplierId;} public String getRequestedBy(){return requestedBy;} public OrderStatus getStatus(){return status;} public BigDecimal getUnitCost(){return unitCost;} public String getApprover(){return approver;} public Instant getApprovedAt(){return approvedAt;} public Instant getCompletedAt(){return completedAt;} public Instant getCreatedAt(){return createdAt;}
 public void approve(String approver){this.status=OrderStatus.APPROVED;this.approver=approver;this.approvedAt=Instant.now();}
 public void reject(String approver){this.status=OrderStatus.REJECTED;this.approver=approver;this.approvedAt=Instant.now();}
 public void start(){this.status=OrderStatus.IN_PROGRESS;}
 public void complete(){this.status=OrderStatus.COMPLETED;this.completedAt=Instant.now();}
}
