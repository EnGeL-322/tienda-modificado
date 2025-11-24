package com.example.msventas.Dto;

import com.example.msventas.Entity.SaleItem;

import java.time.LocalDateTime;
import java.util.List;

public record SaleDto(
        Long id,
        Long customerId,
        String customerName,
        String customerDni,
        SaleItem.SaleStatus status,
        LocalDateTime createdAt,
        LocalDateTime completedAt,
        List<SaleItemDto> items
) {}
