package com.example.msinventory.Dto;

public record ProductDto(
    Long id,
    String sku,
    String name,
    String unit,
    String category,
    Double weight,
    String description,
    Boolean active
) {}