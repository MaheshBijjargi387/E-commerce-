package com.ecommerce.order.controller;

import com.ecommerce.order.dto.CreateOrderRequest;
import com.ecommerce.order.model.Order;
import com.ecommerce.order.security.JwtUtil;
import com.ecommerce.order.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final JwtUtil jwtUtil;

    // Any authenticated user places an order for themselves
    @PostMapping
    public ResponseEntity<Order> createOrder(@Valid @RequestBody CreateOrderRequest request,
                                              HttpServletRequest httpRequest) {
        Long userId = currentUserId(httpRequest);
        String username = currentUsername(httpRequest);
        return ResponseEntity.ok(orderService.createOrder(userId, username, request));
    }

    // The logged-in user's own order history
    @GetMapping("/my")
    public ResponseEntity<List<Order>> getMyOrders(HttpServletRequest httpRequest) {
        Long userId = currentUserId(httpRequest);
        return ResponseEntity.ok(orderService.getOrdersForUser(userId));
    }

    // Admin only (enforced in SecurityConfig) - view every order in the system
    @GetMapping("/all")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getById(id));
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        return (header != null && header.startsWith("Bearer ")) ? header.substring(7) : null;
    }

    private Long currentUserId(HttpServletRequest request) {
        return jwtUtil.extractUserId(extractToken(request));
    }

    private String currentUsername(HttpServletRequest request) {
        return jwtUtil.extractUsername(extractToken(request));
    }
}
