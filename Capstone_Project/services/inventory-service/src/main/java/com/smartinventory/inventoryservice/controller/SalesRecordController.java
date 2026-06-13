package com.smartinventory.inventoryservice.controller;

import com.smartinventory.inventoryservice.dto.*;
import com.smartinventory.inventoryservice.service.SalesRecordService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/sales")
public class SalesRecordController {
 private final SalesRecordService service; public SalesRecordController(SalesRecordService service){this.service=service;}
 @GetMapping public List<SalesRecordResponse> list(){return service.list();}
 @PostMapping public SalesRecordResponse create(@Valid @RequestBody SalesRecordRequest request){return service.create(request);}
}
