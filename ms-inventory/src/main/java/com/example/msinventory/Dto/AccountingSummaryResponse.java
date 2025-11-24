package com.example.msinventory.Dto;

import java.time.LocalDate;

public record AccountingSummaryResponse(
        LocalDate from,
        LocalDate to,
        Double totalPurchases,
        Double totalSales,
        Double profit
) {}