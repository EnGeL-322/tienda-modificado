package com.example.mscompras.Controller;

import com.example.mscompras.Dto.CreatePurchaseDto;
import com.example.mscompras.Dto.CreatePurchaseItemDto;
import com.example.mscompras.Dto.PurchaseOrderDto;
import com.example.mscompras.Service.PurchaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/purchases")
@RequiredArgsConstructor
public class PurchaseController {
    private final PurchaseService purchaseService;

    @PostMapping
    public ResponseEntity<PurchaseOrderDto> create(@RequestBody CreatePurchaseDto dto) {
        return ResponseEntity.ok(purchaseService.create(dto));
    }

    // agregar ítem a una orden (carrito de compras)
    @PostMapping("/{id}/items")
    public ResponseEntity<PurchaseOrderDto> addItem(
            @PathVariable Long id,
            @RequestBody CreatePurchaseItemDto dto
    ) {
        return ResponseEntity.ok(purchaseService.addItem(id, dto));
    }

    @PostMapping("/{id}/receive")
    public ResponseEntity<PurchaseOrderDto> receive(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseService.receive(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrderDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseService.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<PurchaseOrderDto>> getAll() {
        return ResponseEntity.ok(purchaseService.findAll());
    }
}
