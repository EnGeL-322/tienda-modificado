package com.example.msventas.Dto;

public record CreateSaleItemDto(
        String productSku,
        Integer quantity,
        Double unitPrice,
        String unitType,        // "UNIDAD", "MEDIA_CAJA", "CAJA", etc.
        Integer unitsPerPackage // cuántas unidades base trae esta presentación
) {}
