package com.smartinventory.inventoryservice.service;

import com.smartinventory.inventoryservice.config.RabbitConfig;
import com.smartinventory.inventoryservice.domain.*;
import com.smartinventory.inventoryservice.dto.*;
import com.smartinventory.inventoryservice.repository.*;
import java.util.Map;
import java.util.UUID;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryService {
 private final InventoryItemRepository items; private final StockMovementRepository movements; private final RabbitTemplate rabbitTemplate;
 public InventoryService(InventoryItemRepository items,StockMovementRepository movements,RabbitTemplate rabbitTemplate){this.items=items;this.movements=movements;this.rabbitTemplate=rabbitTemplate;}
 public Page<InventoryItemResponse> search(String query, Pageable pageable){Page<InventoryItem> page=(query==null||query.isBlank())?items.findAll(pageable):items.findByNameContainingIgnoreCaseOrSkuContainingIgnoreCase(query,query,pageable); return page.map(this::toResponse);} 
 public InventoryItemResponse get(UUID id){return items.findById(id).map(this::toResponse).orElseThrow(() -> new IllegalArgumentException("Inventory item not found"));}
 @Transactional public InventoryItemResponse create(InventoryItemRequest request){InventoryItem item=items.save(new InventoryItem(request.sku(),request.name(),request.category(),request.warehouseCode(),request.quantity(),request.lowStockThreshold(),request.unitCost())); movements.save(new StockMovement(item.getId(),request.quantity(),"INITIAL_STOCK")); publishLowStockIfNeeded(item); return toResponse(item);} 
 @Transactional public InventoryItemResponse update(UUID id,InventoryItemRequest request){InventoryItem item=items.findById(id).orElseThrow(() -> new IllegalArgumentException("Inventory item not found")); item.update(request.sku(),request.name(),request.category(),request.warehouseCode(),request.quantity(),request.lowStockThreshold(),request.unitCost()); publishLowStockIfNeeded(item); return toResponse(item);} 
 @Transactional public InventoryItemResponse adjust(UUID id,StockAdjustmentRequest request){InventoryItem item=items.findById(id).orElseThrow(() -> new IllegalArgumentException("Inventory item not found")); item.adjust(request.quantityDelta()); movements.save(new StockMovement(id,request.quantityDelta(),request.reason())); publishLowStockIfNeeded(item); return toResponse(item);} 
 @Transactional public void delete(UUID id){items.deleteById(id);} 
 @RabbitListener(queues="inventory.procurement.completed") @Transactional public void handleProcurementCompleted(Map<String,Object> event){Object sku=event.get("sku"); Object qty=event.get("quantity"); if(sku==null||qty==null){return;} int quantity=Integer.parseInt(String.valueOf(qty)); items.findAll().stream().filter(i -> i.getSku().equals(String.valueOf(sku))).findFirst().ifPresent(item -> { item.adjust(quantity); movements.save(new StockMovement(item.getId(), quantity, "PROCUREMENT_COMPLETED")); });}
 private void publishLowStockIfNeeded(InventoryItem item){ if(item.isLowStock()){ rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE,"inventory.low_stock_detected",Map.of("itemId",item.getId().toString(),"sku",item.getSku(),"name",item.getName(),"quantity",item.getQuantity(),"threshold",item.getLowStockThreshold())); } }
 private InventoryItemResponse toResponse(InventoryItem i){return new InventoryItemResponse(i.getId(),i.getSku(),i.getName(),i.getCategory(),i.getWarehouseCode(),i.getQuantity(),i.getLowStockThreshold(),i.getUnitCost(),i.getValuation(),i.isLowStock(),i.getUpdatedAt());}
}
