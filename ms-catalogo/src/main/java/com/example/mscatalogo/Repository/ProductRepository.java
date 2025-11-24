package com.example.mscatalogo.Repository;

import com.example.mscatalogo.Entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySku(String sku);

    // Para generar un SKU incremental basado en el último ID
    Optional<Product> findTopByOrderByIdDesc();
}
