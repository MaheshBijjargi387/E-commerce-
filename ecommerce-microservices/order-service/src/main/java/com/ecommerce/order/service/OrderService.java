package com.ecommerce.order.service;

import com.ecommerce.order.dto.CreateOrderRequest;
import com.ecommerce.order.dto.OrderItemRequest;
import com.ecommerce.order.dto.ProductDto;
import com.ecommerce.order.model.Order;
import com.ecommerce.order.model.OrderItem;
import com.ecommerce.order.model.OrderStatus;
import com.ecommerce.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate;

    @Value("${services.product-service.url}")
    private String productServiceUrl;

    public Order createOrder(Long userId, String username, CreateOrderRequest request) {
        BigDecimal total = BigDecimal.ZERO;
        Order order = Order.builder()
                .userId(userId)
                .username(username)
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.ZERO)
                .build();

        for (OrderItemRequest itemReq : request.getItems()) {
            ProductDto product = fetchProduct(itemReq.getProductId());

            if (product.getStock() < itemReq.getQuantity()) {
                throw new IllegalArgumentException(
                        "Insufficient stock for product '" + product.getName() + "'");
            }

            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            total = total.add(lineTotal);

            OrderItem item = OrderItem.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .price(product.getPrice())
                    .quantity(itemReq.getQuantity())
                    .order(order)
                    .build();

            order.getItems().add(item);
        }

        order.setTotalAmount(total);
        return orderRepository.save(order);
    }

    private ProductDto fetchProduct(Long productId) {
        try {
            ProductDto product = restTemplate.getForObject(
                    productServiceUrl + "/api/products/" + productId, ProductDto.class);
            if (product == null) {
                throw new NoSuchElementException("Product not found with id " + productId);
            }
            return product;
        } catch (Exception e) {
            throw new NoSuchElementException("Product not found with id " + productId);
        }
    }

    public List<Order> getOrdersForUser(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Order not found with id " + id));
    }
}
