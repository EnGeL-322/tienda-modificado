package com.example.mscompras.Dto;

public record CreatePurchaseItemDto(
    String productSku,
    Integer quantity,
    Double unitPrice
) {}