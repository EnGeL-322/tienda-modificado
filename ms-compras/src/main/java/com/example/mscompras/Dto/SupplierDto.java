package com.example.mscompras.Dto;

public record SupplierDto(
        Long id,
        String name,
        String ruc,
        String address,
        String phone,
        String email,
        Boolean active
) {}
