package com.example.mscompras.Dto;

import java.util.List;

public record CreatePurchaseDto(
    String supplierName,
    List<CreatePurchaseItemDto> items
) {}