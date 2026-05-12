package com.smartinventory.userservice.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_profiles")
public class UserProfile {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false, unique = true)
    private String email;
    @Column(nullable = false)
    private String fullName;
    @Column(nullable = false)
    private String role;
    private String phone;
    private String warehouseCode;
    private String jobTitle;
    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
    protected UserProfile() {}
    public UserProfile(String email, String fullName, String role, String phone, String warehouseCode, String jobTitle) {
        this.email=email; this.fullName=fullName; this.role=role; this.phone=phone; this.warehouseCode=warehouseCode; this.jobTitle=jobTitle;
    }
    public UUID getId(){return id;} public String getEmail(){return email;} public String getFullName(){return fullName;} public String getRole(){return role;} public String getPhone(){return phone;} public String getWarehouseCode(){return warehouseCode;} public String getJobTitle(){return jobTitle;} public Instant getCreatedAt(){return createdAt;}
    public void update(String fullName, String role, String phone, String warehouseCode, String jobTitle){this.fullName=fullName; this.role=role; this.phone=phone; this.warehouseCode=warehouseCode; this.jobTitle=jobTitle;}
}
