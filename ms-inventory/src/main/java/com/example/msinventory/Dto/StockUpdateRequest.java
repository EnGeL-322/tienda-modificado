package com.example.msinventory.Dto;

public record StockUpdateRequest(
        String productSku,
        Integer quantity,
        String type,     // "ENTRADA" o "SALIDA"
        String reference,
        String reason
) {}