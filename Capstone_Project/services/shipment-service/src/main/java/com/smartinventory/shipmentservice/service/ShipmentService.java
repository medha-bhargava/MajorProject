package com.smartinventory.shipmentservice.service;

import com.smartinventory.shipmentservice.config.RabbitConfig;
import com.smartinventory.shipmentservice.domain.Shipment;
import com.smartinventory.shipmentservice.dto.*;
import com.smartinventory.shipmentservice.repository.ShipmentRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ShipmentService {
 private final ShipmentRepository repository; private final RabbitTemplate rabbitTemplate;
 public ShipmentService(ShipmentRepository repository,RabbitTemplate rabbitTemplate){this.repository=repository;this.rabbitTemplate=rabbitTemplate;}
 public List<ShipmentResponse> list(){return repository.findAll().stream().map(this::toResponse).toList();}
 public ShipmentResponse get(UUID id){return repository.findById(id).map(this::toResponse).orElseThrow(() -> new IllegalArgumentException("Shipment not found"));}
 @Transactional public ShipmentResponse create(ShipmentRequest request){return toResponse(repository.save(new Shipment(request.trackingNumber(),request.carrier(),request.originWarehouse(),request.destinationWarehouse(),request.sku(),request.quantity(),request.orderId())));} 
 @Transactional public ShipmentResponse markInTransit(UUID id){Shipment s=find(id); s.inTransit(); return toResponse(s);} 
 @Transactional public ShipmentResponse markDelivered(UUID id){Shipment s=find(id); s.delivered(); Map<String,Object> event=new HashMap<>(); event.put("shipmentId",id.toString()); event.put("trackingNumber",s.getTrackingNumber()); event.put("destinationWarehouse",s.getDestinationWarehouse()); if(s.getSku()!=null){event.put("sku",s.getSku());} if(s.getQuantity()!=null){event.put("quantity",s.getQuantity());} if(s.getOrderId()!=null){event.put("orderId",s.getOrderId().toString());} rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE,"shipment.delivered",event); return toResponse(s);} 
 @Transactional public ShipmentResponse cancel(UUID id){Shipment s=find(id); s.cancel(); return toResponse(s);} 
 private Shipment find(UUID id){return repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Shipment not found"));}
 private ShipmentResponse toResponse(Shipment s){return new ShipmentResponse(s.getId(),s.getTrackingNumber(),s.getCarrier(),s.getOriginWarehouse(),s.getDestinationWarehouse(),s.getSku(),s.getQuantity(),s.getOrderId(),s.getStatus(),s.getShippedAt(),s.getDeliveredAt(),s.getCreatedAt());}
}
