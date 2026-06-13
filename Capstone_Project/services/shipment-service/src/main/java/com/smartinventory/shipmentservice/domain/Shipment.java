package com.smartinventory.shipmentservice.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name="shipments")
public class Shipment {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
 @Column(nullable=false) private String trackingNumber; @Column(nullable=false) private String carrier; @Column(nullable=false) private String originWarehouse; @Column(nullable=false) private String destinationWarehouse;
 private String sku; private Integer quantity; private UUID orderId;
 @Enumerated(EnumType.STRING) @Column(nullable=false) private ShipmentStatus status=ShipmentStatus.CREATED;
 private Instant shippedAt; private Instant deliveredAt; @Column(nullable=false,updatable=false) private Instant createdAt=Instant.now();
 protected Shipment() {}
 public Shipment(String trackingNumber,String carrier,String originWarehouse,String destinationWarehouse,String sku,Integer quantity,UUID orderId){this.trackingNumber=trackingNumber;this.carrier=carrier;this.originWarehouse=originWarehouse;this.destinationWarehouse=destinationWarehouse;this.sku=sku;this.quantity=quantity;this.orderId=orderId;}
 public UUID getId(){return id;} public String getTrackingNumber(){return trackingNumber;} public String getCarrier(){return carrier;} public String getOriginWarehouse(){return originWarehouse;} public String getDestinationWarehouse(){return destinationWarehouse;} public String getSku(){return sku;} public Integer getQuantity(){return quantity;} public UUID getOrderId(){return orderId;} public ShipmentStatus getStatus(){return status;} public Instant getShippedAt(){return shippedAt;} public Instant getDeliveredAt(){return deliveredAt;} public Instant getCreatedAt(){return createdAt;}
 public void inTransit(){this.status=ShipmentStatus.IN_TRANSIT;this.shippedAt=Instant.now();}
 public void delivered(){this.status=ShipmentStatus.DELIVERED;this.deliveredAt=Instant.now();}
 public void cancel(){this.status=ShipmentStatus.CANCELLED;}
}
