package com.example.mscatalogo.Dto;

public record ProductDto(
        Long id,
        String sku,
        String name,
        String unit,
        String category,
        String description,
        Boolean active,
        Integer unitsPerBox,
        Integer unitsPerPack
) {}
