package com.example.msinventory.Service;

import com.example.msinventory.Dto.*;
import com.example.msinventory.Entity.Inventory;
import com.example.msinventory.Entity.InventoryMovement;
import com.example.msinventory.Repository.InventoryMovementRepository;
import com.example.msinventory.Repository.InventoryRepository;
import com.example.msinventory.feign.ProductClient;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryMovementRepository movementRepository;
    private final ProductClient productClient;

    public InventoryDto getStock(String productSku) {
        return inventoryRepository.findByProductSku(productSku)
                .map(this::toDto)
                .orElseThrow(() -> new RuntimeException("Stock not found"));
    }

    @Transactional
    public void updateStock(StockUpdateRequest dto) {
        if (dto.productSku() == null || dto.productSku().isBlank()) {
            throw new IllegalArgumentException("SKU no puede ser vacío");
        }

        // Buscar o crear inventario
        Inventory inv = inventoryRepository
                .findByProductSku(dto.productSku())
                .orElseGet(() -> {
                    Inventory i = new Inventory();
                    i.setProductSku(dto.productSku());
                    i.setQuantity(0);
                    return i;
                });

        int current = inv.getQuantity() == null ? 0 : inv.getQuantity();
        int delta = dto.quantity() != null ? dto.quantity() : 0;

        InventoryMovement.MovementType type;
        try {
            type = InventoryMovement.MovementType.valueOf(dto.type().toUpperCase());
        } catch (Exception e) {
            throw new IllegalArgumentException("Tipo de movimiento inválido: " + dto.type());
        }

        int newQty = current;
        if (type == InventoryMovement.MovementType.ENTRADA) {
            newQty = current + delta;
        } else if (type == InventoryMovement.MovementType.SALIDA) {
            newQty = current - delta;
            if (newQty < 0) {
                newQty = 0; // o lanzar excepción si quieres evitar negativos
            }
        }

        inv.setQuantity(newQty);
        inventoryRepository.save(inv);

        // Registrar movimiento
        InventoryMovement movement = new InventoryMovement();
        movement.setProductSku(dto.productSku());
        movement.setQuantity(delta);
        movement.setType(type);
        movement.setReference(dto.reference());
        movement.setReason(dto.reason());
        movementRepository.save(movement);
    }

    public List<MovementDto> getMovements(String productSku) {
        return movementRepository.findByProductSkuOrderByCreatedAtDesc(productSku)
                .stream()
                .map(this::toMovementDto)
                .toList();
    }

    private InventoryDto toDto(Inventory i) {
        return new InventoryDto(i.getId(), i.getProductSku(), i.getLocation(), i.getQuantity());
    }

    private MovementDto toMovementDto(InventoryMovement m) {
        return new MovementDto(
                m.getId(),
                m.getProductSku(),
                m.getQuantity(),
                m.getType(),
                m.getReference(),
                m.getReason(),
                m.getCreatedAt()
        );
    }
}
