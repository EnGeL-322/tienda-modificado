package com.example.mscatalogo.Dto;

public record CreateProductDto(
        String sku,
        String name,
        String unit,
        String category,
        String description,
        Integer unitsPerBox,
        Integer unitsPerPack
) {}
