package com.example.msventas.Dto;

import java.util.List;

public record CreateSaleDto(
        Long customerId,                    // 👈 viene del front
        List<CreateSaleItemDto> items
) {}
