package com.smartinventory.shipmentservice.service;

import com.smartinventory.shipmentservice.config.RabbitConfig;
import com.smartinventory.shipmentservice.domain.Shipment;
import com.smartinventory.shipmentservice.dto.*;
import com.smartinventory.shipmentservice.repository.ShipmentRepository;
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
 @Transactional public ShipmentResponse create(ShipmentRequest request){return toResponse(repository.save(new Shipment(request.trackingNumber(),request.carrier(),request.originWarehouse(),request.destinationWarehouse())));} 
 @Transactional public ShipmentResponse markInTransit(UUID id){Shipment s=find(id); s.inTransit(); return toResponse(s);} 
 @Transactional public ShipmentResponse markDelivered(UUID id){Shipment s=find(id); s.delivered(); rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE,"shipment.delivered",Map.of("shipmentId",id.toString(),"trackingNumber",s.getTrackingNumber(),"destinationWarehouse",s.getDestinationWarehouse())); return toResponse(s);} 
 @Transactional public ShipmentResponse cancel(UUID id){Shipment s=find(id); s.cancel(); return toResponse(s);} 
 private Shipment find(UUID id){return repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Shipment not found"));}
 private ShipmentResponse toResponse(Shipment s){return new ShipmentResponse(s.getId(),s.getTrackingNumber(),s.getCarrier(),s.getOriginWarehouse(),s.getDestinationWarehouse(),s.getStatus(),s.getShippedAt(),s.getDeliveredAt(),s.getCreatedAt());}
}
