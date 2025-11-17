package com.example.mscompras.Dto;

public record StockUpdateDto(
    String productSku,
    Integer quantity,
    MovementType type,
    String reference,
    String reason
) {
    public enum MovementType {
        ENTRADA, SALIDA
    }
}