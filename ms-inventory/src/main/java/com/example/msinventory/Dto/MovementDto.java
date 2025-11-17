package com.example.msinventory.Dto;

import com.example.msinventory.Entity.InventoryMovement;

import java.time.LocalDateTime;

public record MovementDto(
    Long id,
    String productSku,
    Integer quantity,
    InventoryMovement.MovementType type,
    String reference,
    String reason,
    LocalDateTime createdAt
) {}