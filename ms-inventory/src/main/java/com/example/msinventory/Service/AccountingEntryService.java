package com.example.msinventory.Service;

import com.example.msinventory.Dto.AccountBalanceResponse;
import com.example.msinventory.Dto.AccountingSummaryResponse;
import com.example.msinventory.Entity.AccountingEntry;
import com.example.msinventory.Repository.AccountingEntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class AccountingEntryService {
    private static final double IGV_RATE = 0.18;

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private final AccountingEntryRepository repository;

    public AccountingEntryService(AccountingEntryRepository repository) {
        this.repository = repository;
    }

    // ================== CREACIÓN DE ASIENTOS ==================

    @Transactional
    public AccountingEntry createGeneric(
            String type,
            String debitAccount,
            String creditAccount,
            Double amount,
            String referenceType,
            Long referenceId,
            String description
    ) {
        AccountingEntry entry = new AccountingEntry(
                LocalDateTime.now(),
                type,
                debitAccount,
                creditAccount,
                amount,
                referenceType,
                referenceId,
                description
        );
        return repository.save(entry);
    }

    // 👉 Para registrar una COMPRA (cuando se recibe la orden)
    @Transactional
    public AccountingEntry createForPurchase(Long purchaseId, Double total) {
        // total viene con IGV
        double base = round2(total / (1 + IGV_RATE));
        double igv  = round2(total - base);

        // 1️⃣ 60.1 Compras (base) vs 42.1 Proveedores
        createGeneric(
                "COMPRA",
                "60.1 Compras",        // Debe
                "42.1 Proveedores",    // Haber
                base,
                "PURCHASE",
                purchaseId,
                "Compra base (sin IGV) registrada desde ms-compras"
        );

        // 2️⃣ 40.111 IGV crédito fiscal vs 42.1 Proveedores
        AccountingEntry igvEntry = createGeneric(
                "COMPRA",
                "40.111 IGV crédito fiscal",   // Debe
                "42.1 Proveedores",            // Haber
                igv,
                "PURCHASE",
                purchaseId,
                "IGV crédito fiscal de compra"
        );

        // devolvemos uno cualquiera (p.ej. el del IGV), el frontend no usa el retorno
        return igvEntry;
    }


    // 👉 Para registrar una VENTA (cuando se completa la venta)
    @Transactional
    public AccountingEntry createForSale(Long saleId, Double total) {
        double base = round2(total / (1 + IGV_RATE));
        double igv  = round2(total - base);

        // 1️⃣ 12.1 Clientes vs 70.1 Ventas (base)
        createGeneric(
                "VENTA",
                "12.1 Clientes",   // Debe
                "70.1 Ventas",     // Haber
                base,
                "SALE",
                saleId,
                "Venta base (sin IGV) registrada desde ms-ventas"
        );

        // 2️⃣ 12.1 Clientes vs 40.111 IGV por pagar (IGV)
        AccountingEntry igvEntry = createGeneric(
                "VENTA",
                "12.1 Clientes",            // Debe
                "40.111 IGV por pagar",     // Haber
                igv,
                "SALE",
                saleId,
                "IGV por pagar de venta"
        );

        return igvEntry;
    }


    // 👉 Para registrar un ajuste manual desde inventario (por ejemplo mermas)
    @Transactional
    public AccountingEntry createAdjustment(
            String debitAccount,
            String creditAccount,
            Double amount,
            String description
    ) {
        return createGeneric(
                "AJUSTE",
                debitAccount,
                creditAccount,
                amount,
                "ADJUSTMENT",
                null,
                description
        );
    }

    // ================== CONSULTAS / RESÚMENES ==================

    private LocalDateTime startOfDay(LocalDate d) {
        return d.atStartOfDay();
    }

    private LocalDateTime endOfDay(LocalDate d) {
        return d.atTime(LocalTime.MAX);
    }

    // 👉 Resumen tipo: GET /api/accounting/summary?from=2025-01-01&to=2025-01-31
    @Transactional(readOnly = true)
    public AccountingSummaryResponse getSummary(LocalDate from, LocalDate to) {
        LocalDateTime fromDt = startOfDay(from);
        LocalDateTime toDt = endOfDay(to);

        Double totalPurchases = repository.sumAmountByTypeAndDateBetween("COMPRA", fromDt, toDt);
        Double totalSales     = repository.sumAmountByTypeAndDateBetween("VENTA",  fromDt, toDt);

        if (totalPurchases == null) totalPurchases = 0.0;
        if (totalSales == null) totalSales = 0.0;

        Double profit = totalSales - totalPurchases;

        return new AccountingSummaryResponse(
                from,
                to,
                totalPurchases,
                totalSales,
                profit
        );
    }

    // 👉 Listado de asientos para un rango (y opcionalmente tipo)
    @Transactional(readOnly = true)
    public List<AccountingEntry> getEntries(LocalDate from, LocalDate to, String type) {
        LocalDateTime fromDt = startOfDay(from);
        LocalDateTime toDt   = endOfDay(to);

        if (type == null || type.isBlank()) {
            return repository.findByDateBetween(fromDt, toDt);
        }
        return repository.findByTypeAndDateBetween(type.toUpperCase(), fromDt, toDt);
    }

    // 👉 Saldos por cuenta: debitos, creditos, neto
    @Transactional(readOnly = true)
    public AccountBalanceResponse getAccountBalance(LocalDate from, LocalDate to, String account) {
        LocalDateTime fromDt = startOfDay(from);
        LocalDateTime toDt   = endOfDay(to);

        Double debits  = repository.sumDebitsForAccount(account, fromDt, toDt);
        Double credits = repository.sumCreditsForAccount(account, fromDt, toDt);

        if (debits == null) debits = 0.0;
        if (credits == null) credits = 0.0;

        Double net = debits - credits;

        return new AccountBalanceResponse(account, debits, credits, net);
    }

    // 👉 Obtener un asiento puntual
    @Transactional(readOnly = true)
    public AccountingEntry getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    // 👉 Asientos por referencia (ej: todos los de una venta)
    @Transactional(readOnly = true)
    public List<AccountingEntry> getByReference(String referenceType, Long referenceId) {
        return repository.findByReferenceTypeAndReferenceId(referenceType, referenceId);
    }
}
