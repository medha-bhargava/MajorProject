package com.smartinventory.supplierservice.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name="suppliers")
public class Supplier {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
 @Column(nullable=false) private String name;
 @Column(nullable=false, unique=true) private String email;
 private String phone; private String contactPerson; private String productCategory; private Integer averageLeadTimeDays;
 @Column(precision=3, scale=2) private BigDecimal rating;
 @Column(nullable=false, updatable=false) private Instant createdAt=Instant.now();
 protected Supplier() {}
 public Supplier(String name,String email,String phone,String contactPerson,String productCategory,Integer averageLeadTimeDays,BigDecimal rating){this.name=name;this.email=email;this.phone=phone;this.contactPerson=contactPerson;this.productCategory=productCategory;this.averageLeadTimeDays=averageLeadTimeDays;this.rating=rating;}
 public UUID getId(){return id;} public String getName(){return name;} public String getEmail(){return email;} public String getPhone(){return phone;} public String getContactPerson(){return contactPerson;} public String getProductCategory(){return productCategory;} public Integer getAverageLeadTimeDays(){return averageLeadTimeDays;} public BigDecimal getRating(){return rating;} public Instant getCreatedAt(){return createdAt;}
 public void update(String name,String email,String phone,String contactPerson,String productCategory,Integer averageLeadTimeDays,BigDecimal rating){this.name=name;this.email=email;this.phone=phone;this.contactPerson=contactPerson;this.productCategory=productCategory;this.averageLeadTimeDays=averageLeadTimeDays;this.rating=rating;}
}
