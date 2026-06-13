package com.smartinventory.inventoryservice.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name="sales_records")
public class SalesRecord {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
 @Column(nullable=false) private String sku;
 @Column(nullable=false) private String itemName;
 @Column(nullable=false) private int quantity;
 @Column(nullable=false, precision=12, scale=2) private BigDecimal unitCost;
 @Enumerated(EnumType.STRING) @Column(nullable=false) private SalesStatus status;
 @Column(nullable=false, updatable=false) private Instant createdAt=Instant.now();
 protected SalesRecord() {}
 public SalesRecord(String sku,String itemName,int quantity,BigDecimal unitCost,SalesStatus status){this.sku=sku;this.itemName=itemName;this.quantity=quantity;this.unitCost=unitCost;this.status=status;}
 public UUID getId(){return id;} public String getSku(){return sku;} public String getItemName(){return itemName;} public int getQuantity(){return quantity;} public BigDecimal getUnitCost(){return unitCost;} public SalesStatus getStatus(){return status;} public Instant getCreatedAt(){return createdAt;}
}
