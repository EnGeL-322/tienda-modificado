package com.example.mscompras.Dto;

public record CreateSupplierDto(
        String name,
        String ruc,
        String address,
        String phone,
        String email
) {}