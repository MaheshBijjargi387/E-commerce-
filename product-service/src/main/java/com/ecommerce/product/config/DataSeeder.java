package com.ecommerce.product.config;

import com.ecommerce.product.model.Product;
import com.ecommerce.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/** Seeds a few demo products on startup so the frontend has data to show immediately. */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;

    @Override
    public void run(String... args) {
        if (productRepository.count() > 0) return;

        productRepository.save(Product.builder()
                .name("Wireless Headphones").description("Over-ear Bluetooth headphones with ANC")
                .price(new BigDecimal("59.99")).stock(25)
                .imageUrl("https://placehold.co/300x300?text=Headphones").category("Electronics").build());

        productRepository.save(Product.builder()
                .name("Mechanical Keyboard").description("RGB backlit mechanical keyboard, blue switches")
                .price(new BigDecimal("79.50")).stock(15)
                .imageUrl("https://placehold.co/300x300?text=Keyboard").category("Electronics").build());

        productRepository.save(Product.builder()
                .name("Running Shoes").description("Lightweight breathable running shoes")
                .price(new BigDecimal("45.00")).stock(40)
                .imageUrl("https://placehold.co/300x300?text=Shoes").category("Footwear").build());

        productRepository.save(Product.builder()
                .name("Coffee Maker").description("12-cup programmable drip coffee maker")
                .price(new BigDecimal("34.99")).stock(10)
                .imageUrl("https://placehold.co/300x300?text=Coffee+Maker").category("Home").build());
    }
}
