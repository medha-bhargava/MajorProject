package com.smartinventory.shipmentservice.controller;

import com.smartinventory.shipmentservice.dto.*;
import com.smartinventory.shipmentservice.service.ShipmentService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/shipments")
public class ShipmentController {
 private final ShipmentService service; public ShipmentController(ShipmentService service){this.service=service;}
 @GetMapping public List<ShipmentResponse> list(){return service.list();}
 @GetMapping("/{id}") public ShipmentResponse get(@PathVariable UUID id){return service.get(id);} 
 @PostMapping public ShipmentResponse create(@Valid @RequestBody ShipmentRequest request){return service.create(request);} 
 @PostMapping("/{id}/in-transit") public ShipmentResponse inTransit(@PathVariable UUID id){return service.markInTransit(id);} 
 @PostMapping("/{id}/delivered") public ShipmentResponse delivered(@PathVariable UUID id){return service.markDelivered(id);} 
 @PostMapping("/{id}/cancel") public ShipmentResponse cancel(@PathVariable UUID id){return service.cancel(id);} 
}
