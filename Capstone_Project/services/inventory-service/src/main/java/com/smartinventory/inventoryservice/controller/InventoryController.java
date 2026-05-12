package com.smartinventory.inventoryservice.controller;

import com.smartinventory.inventoryservice.dto.*;
import com.smartinventory.inventoryservice.service.InventoryService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.data.domain.*;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/inventory")
public class InventoryController {
 private final InventoryService service; public InventoryController(InventoryService service){this.service=service;}
 @GetMapping public Page<InventoryItemResponse> search(@RequestParam(required=false) String q,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="10") int size,@RequestParam(defaultValue="name") String sort){return service.search(q, PageRequest.of(page,size, Sort.by(sort).ascending()));}
 @GetMapping("/{id}") public InventoryItemResponse get(@PathVariable UUID id){return service.get(id);} 
 @PostMapping public InventoryItemResponse create(@Valid @RequestBody InventoryItemRequest request){return service.create(request);} 
 @PutMapping("/{id}") public InventoryItemResponse update(@PathVariable UUID id,@Valid @RequestBody InventoryItemRequest request){return service.update(id,request);} 
 @PostMapping("/{id}/adjust") public InventoryItemResponse adjust(@PathVariable UUID id,@Valid @RequestBody StockAdjustmentRequest request){return service.adjust(id,request);} 
 @DeleteMapping("/{id}") public void delete(@PathVariable UUID id){service.delete(id);} 
}
