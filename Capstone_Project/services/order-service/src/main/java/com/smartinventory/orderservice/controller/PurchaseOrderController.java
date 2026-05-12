package com.smartinventory.orderservice.controller;

import com.smartinventory.orderservice.dto.*;
import com.smartinventory.orderservice.service.PurchaseOrderService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/orders")
public class PurchaseOrderController {
 private final PurchaseOrderService service; public PurchaseOrderController(PurchaseOrderService service){this.service=service;}
 @GetMapping public List<PurchaseOrderResponse> list(){return service.list();}
 @GetMapping("/{id}") public PurchaseOrderResponse get(@PathVariable UUID id){return service.get(id);} 
 @PostMapping public PurchaseOrderResponse create(@Valid @RequestBody PurchaseOrderRequest request){return service.create(request);} 
 @PostMapping("/{id}/approve") public PurchaseOrderResponse approve(@PathVariable UUID id,@Valid @RequestBody ApprovalRequest request){return service.approve(id,request);} 
 @PostMapping("/{id}/reject") public PurchaseOrderResponse reject(@PathVariable UUID id,@Valid @RequestBody ApprovalRequest request){return service.reject(id,request);} 
 @PostMapping("/{id}/start") public PurchaseOrderResponse start(@PathVariable UUID id){return service.start(id);} 
 @PostMapping("/{id}/complete") public PurchaseOrderResponse complete(@PathVariable UUID id){return service.complete(id);} 
}
