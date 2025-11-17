package com.example.msventas.Dto;

import com.example.msventas.Entity.SaleItem;

import java.time.LocalDateTime;
import java.util.List;

public record SaleDto(
    Long id,
    String customerName,
    SaleItem.SaleStatus status,
    LocalDateTime createdAt,
    LocalDateTime completedAt,
    List<SaleItemDto> items
) {}