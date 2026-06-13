package com.smartinventory.orderservice.service;

import com.smartinventory.orderservice.config.RabbitConfig;
import com.smartinventory.orderservice.domain.*;
import com.smartinventory.orderservice.dto.*;
import com.smartinventory.orderservice.repository.PurchaseOrderRepository;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PurchaseOrderService {
 private final PurchaseOrderRepository repository; private final RabbitTemplate rabbitTemplate;
 public PurchaseOrderService(PurchaseOrderRepository repository,RabbitTemplate rabbitTemplate){this.repository=repository;this.rabbitTemplate=rabbitTemplate;}
 public List<PurchaseOrderResponse> list(){return repository.findAll().stream().map(this::toResponse).toList();}
 public PurchaseOrderResponse get(UUID id){return repository.findById(id).map(this::toResponse).orElseThrow(() -> new IllegalArgumentException("Purchase order not found"));}
 @Transactional public PurchaseOrderResponse create(PurchaseOrderRequest request){return toResponse(repository.save(new PurchaseOrder(request.sku(),request.itemName(),request.quantity(),request.supplierId(),request.requestedBy(),request.unitCost())));} 
 @Transactional public PurchaseOrderResponse approve(UUID id,ApprovalRequest request){PurchaseOrder order=find(id); order.approve(request.approver()); rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE,"procurement.approved",Map.of("orderId",id.toString(),"sku",order.getSku(),"itemName",order.getItemName(),"quantity",order.getQuantity())); return toResponse(order);} 
 @Transactional public PurchaseOrderResponse reject(UUID id,ApprovalRequest request){PurchaseOrder order=find(id); order.reject(request.approver()); return toResponse(order);} 
 @Transactional public PurchaseOrderResponse start(UUID id){PurchaseOrder order=find(id); order.start(); return toResponse(order);} 
 @Transactional public PurchaseOrderResponse complete(UUID id){PurchaseOrder order=find(id); order.complete(); rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE,"procurement.completed",Map.of("orderId",id.toString(),"sku",order.getSku(),"itemName",order.getItemName(),"quantity",order.getQuantity(),"supplierId",order.getSupplierId().toString())); return toResponse(order);} 
 private PurchaseOrder find(UUID id){return repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Purchase order not found"));}
 private PurchaseOrderResponse toResponse(PurchaseOrder o){return new PurchaseOrderResponse(o.getId(),o.getSku(),o.getItemName(),o.getQuantity(),o.getSupplierId(),o.getRequestedBy(),o.getStatus(),o.getUnitCost(),o.getApprover(),o.getApprovedAt(),o.getCompletedAt(),o.getCreatedAt());}
}

// package com.smartinventory.orderservice.service;

// import com.smartinventory.orderservice.config.RabbitConfig;
// import com.smartinventory.orderservice.domain.*;
// import com.smartinventory.orderservice.dto.*;
// import com.smartinventory.orderservice.repository.PurchaseOrderRepository;
// import java.util.List;
// import java.util.Map;
// import java.util.UUID;
// import org.springframework.amqp.rabbit.core.RabbitTemplate;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// @Service
// public class PurchaseOrderService {
//  private final PurchaseOrderRepository repository; private final RabbitTemplate rabbitTemplate;
//  public PurchaseOrderService(PurchaseOrderRepository repository,RabbitTemplate rabbitTemplate){this.repository=repository;this.rabbitTemplate=rabbitTemplate;}
//  public List<PurchaseOrderResponse> list(){return repository.findAll().stream().map(this::toResponse).toList();}
//  public PurchaseOrderResponse get(UUID id){return repository.findById(id).map(this::toResponse).orElseThrow(() -> new IllegalArgumentException("Purchase order not found"));}
//  @Transactional public PurchaseOrderResponse create(PurchaseOrderRequest request){return toResponse(repository.save(new PurchaseOrder(request.sku(),request.itemName(),request.quantity(),request.supplierId(),request.requestedBy(),request.unitCost())));} 
//  @Transactional public PurchaseOrderResponse approve(UUID id,ApprovalRequest request){PurchaseOrder order=find(id); order.approve(request.approver()); rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE,"procurement.approved",Map.of("orderId",id.toString(),"sku",order.getSku(),"quantity",order.getQuantity())); return toResponse(order);} 
//  @Transactional public PurchaseOrderResponse reject(UUID id,ApprovalRequest request){PurchaseOrder order=find(id); order.reject(request.approver()); return toResponse(order);} 
//  @Transactional public PurchaseOrderResponse start(UUID id){PurchaseOrder order=find(id); order.start(); return toResponse(order);} 
//  @Transactional public PurchaseOrderResponse complete(UUID id){PurchaseOrder order=find(id); order.complete(); rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE,"procurement.completed",Map.of("orderId",id.toString(),"sku",order.getSku(),"quantity",order.getQuantity(),"supplierId",order.getSupplierId().toString())); return toResponse(order);} 
//  private PurchaseOrder find(UUID id){return repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Purchase order not found"));}
//  private PurchaseOrderResponse toResponse(PurchaseOrder o){return new PurchaseOrderResponse(o.getId(),o.getSku(),o.getItemName(),o.getQuantity(),o.getSupplierId(),o.getRequestedBy(),o.getStatus(),o.getUnitCost(),o.getApprover(),o.getApprovedAt(),o.getCompletedAt(),o.getCreatedAt());}
// }
