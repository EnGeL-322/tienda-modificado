package com.example.mscompras.Dto;

public record CreatePurchaseItemDto(
        String productSku,
        Integer quantity,
        Double unitPrice,
        String unitType,        // "UNIDAD", "MEDIA_CAJA", "CAJA", etc.
        Integer unitsPerPackage // cuántas unidades base trae esta presentación
) {}