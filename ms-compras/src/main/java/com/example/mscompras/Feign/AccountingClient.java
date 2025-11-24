package com.example.mscompras.Feign;

import com.example.mscompras.Dto.PurchaseEntryRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "ms-inventario-service", path = "/accounting") // Solo operaciones de contabilidad
public interface AccountingClient {

    // Ruta para la creación de un asiento contable
    @PostMapping("/purchase")
    void createPurchaseEntry(@RequestBody PurchaseEntryRequest request);
}
