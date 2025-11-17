package com.example.msventas.Dto;

public record CreateSaleItemDto(
    String productSku,
    Integer quantity,
    Double unitPrice
) {}