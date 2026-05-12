package com.smartinventory.supplierservice.controller;

import com.smartinventory.supplierservice.dto.*;
import com.smartinventory.supplierservice.service.SupplierService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/suppliers")
public class SupplierController {
 private final SupplierService service; public SupplierController(SupplierService service){this.service=service;}
 @GetMapping public List<SupplierResponse> list(){return service.list();}
 @GetMapping("/{id}") public SupplierResponse get(@PathVariable UUID id){return service.get(id);} 
 @PostMapping public SupplierResponse create(@Valid @RequestBody SupplierRequest request){return service.create(request);} 
 @PutMapping("/{id}") public SupplierResponse update(@PathVariable UUID id,@Valid @RequestBody SupplierRequest request){return service.update(id,request);} 
 @DeleteMapping("/{id}") public void delete(@PathVariable UUID id){service.delete(id);} 
}
