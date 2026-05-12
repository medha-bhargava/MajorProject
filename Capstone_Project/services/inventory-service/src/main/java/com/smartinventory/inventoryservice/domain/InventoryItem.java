package com.smartinventory.inventoryservice.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name="inventory_items")
public class InventoryItem {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
 @Column(nullable=false) private String sku; @Column(nullable=false) private String name; private String category; private String warehouseCode;
 @Column(nullable=false) private int quantity; @Column(nullable=false) private int lowStockThreshold;
 @Column(nullable=false, precision=12, scale=2) private BigDecimal unitCost;
 @Column(nullable=false) private Instant updatedAt=Instant.now();
 protected InventoryItem() {}
 public InventoryItem(String sku,String name,String category,String warehouseCode,int quantity,int lowStockThreshold,BigDecimal unitCost){this.sku=sku;this.name=name;this.category=category;this.warehouseCode=warehouseCode;this.quantity=quantity;this.lowStockThreshold=lowStockThreshold;this.unitCost=unitCost;}
 public UUID getId(){return id;} public String getSku(){return sku;} public String getName(){return name;} public String getCategory(){return category;} public String getWarehouseCode(){return warehouseCode;} public int getQuantity(){return quantity;} public int getLowStockThreshold(){return lowStockThreshold;} public BigDecimal getUnitCost(){return unitCost;} public Instant getUpdatedAt(){return updatedAt;} public BigDecimal getValuation(){return unitCost.multiply(BigDecimal.valueOf(quantity));}
 public void update(String sku,String name,String category,String warehouseCode,int quantity,int lowStockThreshold,BigDecimal unitCost){this.sku=sku;this.name=name;this.category=category;this.warehouseCode=warehouseCode;this.quantity=quantity;this.lowStockThreshold=lowStockThreshold;this.unitCost=unitCost;this.updatedAt=Instant.now();}
 public void adjust(int delta){this.quantity += delta; this.updatedAt=Instant.now();}
 public boolean isLowStock(){return quantity <= lowStockThreshold;}
}
