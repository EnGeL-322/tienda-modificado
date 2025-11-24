package com.example.mscompras.Dto;

public record PurchaseItemDto(
        Long id,
        String productSku,
        Integer quantity,
        Double unitPrice,
        String unitType,
        Integer unitsPerPackage
) {}