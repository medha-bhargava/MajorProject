package com.smartinventory.supplierservice.service;

import com.smartinventory.supplierservice.config.RabbitConfig;
import com.smartinventory.supplierservice.domain.Supplier;
import com.smartinventory.supplierservice.dto.*;
import com.smartinventory.supplierservice.repository.SupplierRepository;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SupplierService {
 private final SupplierRepository repository; private final RabbitTemplate rabbitTemplate;
 public SupplierService(SupplierRepository repository,RabbitTemplate rabbitTemplate){this.repository=repository;this.rabbitTemplate=rabbitTemplate;}
 public List<SupplierResponse> list(){return repository.findAll().stream().map(this::toResponse).toList();}
 public SupplierResponse get(UUID id){return repository.findById(id).map(this::toResponse).orElseThrow(() -> new IllegalArgumentException("Supplier not found"));}
 @Transactional public SupplierResponse create(SupplierRequest request){Supplier s=repository.save(new Supplier(request.name(),request.email(),request.phone(),request.contactPerson(),request.productCategory(),request.averageLeadTimeDays(),request.rating())); rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE,"supplier.created",Map.of("supplierId",s.getId().toString(),"name",s.getName(),"rating",String.valueOf(s.getRating()))); return toResponse(s);} 
 @Transactional public SupplierResponse update(UUID id,SupplierRequest request){Supplier s=repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Supplier not found")); s.update(request.name(),request.email(),request.phone(),request.contactPerson(),request.productCategory(),request.averageLeadTimeDays(),request.rating()); return toResponse(s);} 
 @Transactional public void delete(UUID id){repository.deleteById(id);} 
 private SupplierResponse toResponse(Supplier s){return new SupplierResponse(s.getId(),s.getName(),s.getEmail(),s.getPhone(),s.getContactPerson(),s.getProductCategory(),s.getAverageLeadTimeDays(),s.getRating(),s.getCreatedAt());}
}
