package com.example.msinventory.Controller;

import com.example.msinventory.Dto.InventoryDto;
import com.example.msinventory.Dto.MovementDto;
import com.example.msinventory.Dto.StockUpdateRequest;
import com.example.msinventory.Entity.Inventory;
import com.example.msinventory.Service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/{sku}")
    public Inventory getStock(@PathVariable String sku) {
        return inventoryService.getStock(sku);
    }

    @PostMapping("/update")
    public ResponseEntity<Void> updateStock(@RequestBody StockUpdateRequest dto) {
        inventoryService.updateStock(dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/movements/{productSku}")
    public ResponseEntity<List<MovementDto>> getMovements(@PathVariable String productSku) {
        return ResponseEntity.ok(inventoryService.getMovements(productSku));
    }
}
