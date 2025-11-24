package com.example.mscompras.Controller;

import com.example.mscompras.Dto.CreateSupplierDto;
import com.example.mscompras.Dto.SupplierDto;
import com.example.mscompras.Service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    @PostMapping
    public ResponseEntity<SupplierDto> create(@RequestBody CreateSupplierDto dto) {
        return ResponseEntity.ok(supplierService.create(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(supplierService.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<SupplierDto>> getAll() {
        return ResponseEntity.ok(supplierService.findAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupplierDto> update(
            @PathVariable Long id,
            @RequestBody CreateSupplierDto dto
    ) {
        return ResponseEntity.ok(supplierService.update(id, dto));
    }

    @PatchMapping("/{id}/active")
    public ResponseEntity<SupplierDto> changeActive(
            @PathVariable Long id,
            @RequestBody(required = false) Boolean active
    ) {
        return ResponseEntity.ok(supplierService.changeActive(id, active));
    }
}
