package com.example.mscompras.Feign;

import com.example.mscompras.Dto.StockUpdateDto;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "ms-inventario-service", path = "/inventory")
public interface InventoryClient {

    @PostMapping("/update")
    @CircuitBreaker(name = "updateStockCB", fallbackMethod = "fallbackUpdateStock")
    void updateStock(@RequestBody StockUpdateDto dto);

    // Fallback method
    default void fallbackUpdateStock(StockUpdateDto dto, Throwable e) {
        System.err.println("⚠️ CircuitBreaker: ms-inventario-service no disponible (SKU: "
                + dto.productSku() + ", Cantidad: " + dto.quantity() + ")");
        // Aquí podrías guardar en cola temporal, BD o simplemente loguear
        // para procesar cuando el inventario vuelva a estar disponible.
    }
}
