package com.example.msinventory.Dto;

public record InventoryDto(
    Long id,
    String productSku,
    String location,
    Integer quantity
) {}