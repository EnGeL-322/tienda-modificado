package com.example.msinventory.feign;

import com.example.msinventory.Dto.ProductDto;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
@FeignClient(name = "ms-catalogo-service", path = "/products")
public interface ProductClient {

    @GetMapping("/sku/{sku}")
    @CircuitBreaker(name = "productPorSkuCB", fallbackMethod = "fallbackGetBySku")
    ProductDto getBySku(@PathVariable String sku);

    default ProductDto fallbackGetBySku(String sku, Throwable e) {
        System.err.println("⚠️ CircuitBreaker: ms-catalogo-service no disponible (SKU: " + sku + ")");
        return new ProductDto(
                0L,                  // id temporal
                sku,                 // SKU que se buscó
                "Producto temporal", // nombre por defecto
                "N/A",               // unidad
                "N/A",               // categoría
                0.0,                   // peso
                "Servicio no disponible temporalmente", // descripción
                false                // activo
        );
    }
}
