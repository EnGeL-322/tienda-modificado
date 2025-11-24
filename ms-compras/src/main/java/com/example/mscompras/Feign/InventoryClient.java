package com.example.mscompras.Feign;

import com.example.mscompras.Dto.PurchaseEntryRequest;
import com.example.mscompras.Dto.StockUpdateDto;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "ms-inventario-service", path = "/inventory") // Solo operaciones de inventario
public interface InventoryClient {

    // Ruta para actualizar el stock
    @PostMapping("/update")
    void updateStock(@RequestBody StockUpdateDto dto);
}
