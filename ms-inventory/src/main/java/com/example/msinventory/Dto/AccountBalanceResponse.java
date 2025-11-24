package com.example.msinventory.Dto;

public record AccountBalanceResponse(
        String account,
        Double totalDebits,
        Double totalCredits,
        Double net // debits - credits
) {}