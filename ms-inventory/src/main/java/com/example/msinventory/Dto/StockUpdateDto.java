package com.example.msinventory.Dto;

import com.example.msinventory.Entity.InventoryMovement;

public record StockUpdateDto(
    String productSku,
    Integer quantity,
    InventoryMovement.MovementType type,
    String reference,
    String reason
) {}