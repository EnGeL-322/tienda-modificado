package com.example.msventas.Dto;

public record SaleItemDto(
        Long id,
        String productSku,
        Integer quantity,
        Double unitPrice,
        String unitType,
        Integer unitsPerPackage
) {}
