package com.smartinventory.gateway.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class JwtGatewayFilter implements GlobalFilter, Ordered {
    private final byte[] secret;
    private final Map<String, Window> windows = new ConcurrentHashMap<>();
    private static final int RATE_LIMIT_PER_MINUTE = 1000;

    public JwtGatewayFilter(@Value("${app.jwt-secret}") String jwtSecret) {
        System.out.println("Gateway JWT secret length = " + jwtSecret.length());
        this.secret = jwtSecret.getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getPath().value();
        if (isRateLimited(exchange)) {
            exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
            return exchange.getResponse().setComplete();
        }
        if (isPublic(path)) {
            return chain.filter(exchange);
        }
        String header = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
        try {
            var claims = Jwts.parser().verifyWith(Keys.hmacShaKeyFor(secret)).build().parseSignedClaims(header.substring(7)).getPayload();
            
            // var mutated = exchange.getRequest().mutate()
            //         .header("X-User-Email", claims.getSubject())
            //         .header("X-User-Role", String.valueOf(claims.get("role")))
            //         .build();

            // var mutated = exchange.getRequest().mutate()
            //     .headers(headers -> {
            //         headers.set("X-User-Email", claims.getSubject());
            //         headers.set("X-User-Role", String.valueOf(claims.get("role")));
            //     })
            //     .build();
            // return chain.filter(exchange.mutate().request(mutated).build());

            Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(secret))
                .build()
                .parseSignedClaims(header.substring(7))
                .getPayload();
            return chain.filter(exchange);
        } catch (RuntimeException ex) {
            ex.printStackTrace();
            System.out.println("JWT validation failed: " + ex.getClass().getName());
            System.out.println("JWT validation message: " + ex.getMessage());
            // ex.printStackTrace();
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
    }

    private boolean isPublic(String path) {
        return path.startsWith("/api/auth/") || path.startsWith("/actuator") || path.contains("/swagger") || path.contains("/v3/api-docs");
    }

    private boolean isRateLimited(ServerWebExchange exchange) {
        String key = exchange.getRequest().getRemoteAddress() == null ? "unknown" : exchange.getRequest().getRemoteAddress().getAddress().getHostAddress();
        long now = System.currentTimeMillis();
        Window window = windows.compute(key, (ignored, existing) -> existing == null || now - existing.startedAt > Duration.ofMinutes(1).toMillis() ? new Window(now, 1) : existing.increment());
        // return window.count > 180;
        return window.count > RATE_LIMIT_PER_MINUTE;
    }

    @Override
    public int getOrder() {
        return -100;
    }

    private record Window(long startedAt, int count) {
        Window increment() { return new Window(startedAt, count + 1); }
    }
}
