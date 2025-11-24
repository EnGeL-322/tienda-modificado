package com.example.msventas.Controller;

import com.example.msventas.Dto.CreateSaleDto;
import com.example.msventas.Dto.CreateSaleItemDto;
import com.example.msventas.Dto.SaleDto;
import com.example.msventas.Service.SaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sales")
@RequiredArgsConstructor
public class SaleController {
    private final SaleService saleService;

    @PostMapping
    public ResponseEntity<SaleDto> create(@RequestBody CreateSaleDto dto) {
        return ResponseEntity.ok(saleService.create(dto));
    }

    // NUEVO: agregar ítem a una venta (carrito)
    @PostMapping("/{id}/items")
    public ResponseEntity<SaleDto> addItem(
            @PathVariable Long id,
            @RequestBody CreateSaleItemDto dto
    ) {
        return ResponseEntity.ok(saleService.addItem(id, dto));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<SaleDto> complete(@PathVariable Long id) {
        return ResponseEntity.ok(saleService.complete(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SaleDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(saleService.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<SaleDto>> getAll() {
        return ResponseEntity.ok(saleService.findAll());
    }
}
