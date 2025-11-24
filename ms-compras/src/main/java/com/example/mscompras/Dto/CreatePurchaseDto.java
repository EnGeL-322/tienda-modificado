package com.example.mscompras.Dto;

import java.util.List;

public record CreatePurchaseDto(
        Long supplierId,                 // <--- antes supplierName
        List<CreatePurchaseItemDto> items
) {}