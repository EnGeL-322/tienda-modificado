package com.example.msventas.Dto;

import java.util.List;

public record CreateSaleDto(
    String customerName,
    List<CreateSaleItemDto> items
) {}