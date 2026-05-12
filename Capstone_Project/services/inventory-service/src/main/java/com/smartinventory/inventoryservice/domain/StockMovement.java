package com.smartinventory.inventoryservice.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name="stock_movements")
public class StockMovement {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
 @Column(nullable=false) private UUID itemId; @Column(nullable=false) private int quantityDelta; @Column(nullable=false) private String reason; @Column(nullable=false) private Instant createdAt=Instant.now();
 protected StockMovement() {}
 public StockMovement(UUID itemId,int quantityDelta,String reason){this.itemId=itemId;this.quantityDelta=quantityDelta;this.reason=reason;}
 public UUID getId(){return id;} public UUID getItemId(){return itemId;} public int getQuantityDelta(){return quantityDelta;} public String getReason(){return reason;} public Instant getCreatedAt(){return createdAt;}
}
