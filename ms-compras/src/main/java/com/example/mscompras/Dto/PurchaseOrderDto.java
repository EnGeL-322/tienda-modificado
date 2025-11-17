package com.example.mscompras.Dto;

import com.example.mscompras.Entity.PurchaseOrder;

import java.time.LocalDateTime;
import java.util.List;

public record PurchaseOrderDto(
    Long id,
    String supplierName,
    PurchaseOrder.PurchaseStatus status,
    LocalDateTime createdAt,
    LocalDateTime receivedAt,
    List<PurchaseItemDto> items
) {}