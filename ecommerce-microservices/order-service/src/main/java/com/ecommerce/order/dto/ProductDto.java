package com.ecommerce.order.dto;

import lombok.Data;
import java.math.BigDecimal;

/** Mirrors the shape returned by product-service's GET /api/products/{id} */
@Data
public class ProductDto {
    private Long id;
    private String name;
    private BigDecimal price;
    private Integer stock;
}
