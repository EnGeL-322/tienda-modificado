package com.example.msventas.Dto;

public record TopCustomerDto(
        Long customerId,
        String dni,
        String name,
        Long totalSales
) {}
