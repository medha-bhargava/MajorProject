package com.smartinventory.inventoryservice.service;

import com.smartinventory.inventoryservice.config.RabbitConfig;
import com.smartinventory.inventoryservice.domain.*;
import com.smartinventory.inventoryservice.dto.*;
import com.smartinventory.inventoryservice.repository.*;
import java.util.List;
import java.util.Map;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SalesRecordService {
 private final SalesRecordRepository records; private final InventoryItemRepository items; private final StockMovementRepository movements; private final RabbitTemplate rabbitTemplate;
 public SalesRecordService(SalesRecordRepository records,InventoryItemRepository items,StockMovementRepository movements,RabbitTemplate rabbitTemplate){this.records=records;this.items=items;this.movements=movements;this.rabbitTemplate=rabbitTemplate;}
 public List<SalesRecordResponse> list(){return records.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse).toList();}
 @Transactional public SalesRecordResponse create(SalesRecordRequest request){String sku=request.sku().trim(); InventoryItem item=items.findBySku(sku).orElseThrow(() -> new IllegalArgumentException("Inventory item not found for SKU "+sku)); if(request.status()==SalesStatus.SOLD&&request.quantity()>item.getQuantity()){throw new IllegalArgumentException("Sold quantity cannot be greater than available inventory");} int quantityDelta=request.status()==SalesStatus.SOLD?-request.quantity():request.quantity(); item.adjust(quantityDelta); movements.save(new StockMovement(item.getId(),quantityDelta,"SALES_"+request.status().name())); SalesRecord record=records.save(new SalesRecord(sku,request.itemName().trim(),request.quantity(),request.unitCost(),request.status())); publishLowStockIfNeeded(item); return toResponse(record);}
 private void publishLowStockIfNeeded(InventoryItem item){ if(item.isLowStock()){ rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE,"inventory.low_stock_detected",Map.of("itemId",item.getId().toString(),"sku",item.getSku(),"name",item.getName(),"quantity",item.getQuantity(),"threshold",item.getLowStockThreshold())); } }
 private SalesRecordResponse toResponse(SalesRecord record){return new SalesRecordResponse(record.getId(),record.getSku(),record.getItemName(),record.getQuantity(),record.getUnitCost(),record.getStatus(),record.getCreatedAt());}
}
