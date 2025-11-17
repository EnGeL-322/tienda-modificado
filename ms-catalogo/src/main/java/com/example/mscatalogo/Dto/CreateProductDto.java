package com.example.mscatalogo.Dto;

public record CreateProductDto(
    String sku,
    String name,
    String unit,
    String category,
    Double weight,
    String description
) {}