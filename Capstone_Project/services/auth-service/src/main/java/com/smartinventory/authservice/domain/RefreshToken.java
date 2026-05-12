package com.smartinventory.authservice.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "refresh_tokens", indexes = @Index(name = "idx_refresh_token_token", columnList = "token", unique = true))
public class RefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false, unique = true, length = 120)
    private String token;
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private AppUser user;
    @Column(nullable = false)
    private Instant expiresAt;
    @Column(nullable = false)
    private boolean revoked;

    protected RefreshToken() {}
    public RefreshToken(String token, AppUser user, Instant expiresAt) {
        this.token = token;
        this.user = user;
        this.expiresAt = expiresAt;
    }
    public String getToken() { return token; }
    public AppUser getUser() { return user; }
    public Instant getExpiresAt() { return expiresAt; }
    public boolean isRevoked() { return revoked; }
    public void revoke() { this.revoked = true; }
}
