package com.example.msinventory.Service;

import com.example.msinventory.Dto.AccountBalanceResponse;
import com.example.msinventory.Dto.AccountingSummaryResponse;
import com.example.msinventory.Entity.AccountingEntry;
import com.example.msinventory.Repository.AccountingEntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.stream.Collectors;


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
// 👉 Para registrar una COMPRA (cuando se recibe la orden)
    @Transactional
    public AccountingEntry createForPurchase(Long purchaseId, Double total) {
        // total viene con IGV
        double base = round2(total / (1 + IGV_RATE));
        double igv  = round2(total - base);

        // Textos que quieres ver en el libro diario
        String descCompra  = "Por la compra de mercaderías (compra N° " + purchaseId + ")";
        String descDestino = "Por el destino de las mercaderías de la compra N° " + purchaseId;
        String descCancel  = "Por la cancelación de la factura de la compra N° " + purchaseId;

        // 1️⃣ Compra de mercaderías (60.1 + 40.111 vs 42.1 Proveedores)
        //    NOTA: ambos asientos usan la MISMA descripción para que se agrupen.
        createGeneric(
                "COMPRA",
                "60.1 Compras",        // Debe
                "42.1 Proveedores",    // Haber
                base,
                "PURCHASE",
                purchaseId,
                descCompra
        );

        AccountingEntry igvEntry = createGeneric(
                "COMPRA",
                "40.111 IGV crédito fiscal",   // Debe
                "42.1 Proveedores",            // Haber
                igv,
                "PURCHASE",
                purchaseId,
                descCompra    // misma descripción: "Por la compra de mercaderías..."
        );

        // 2️⃣ Asiento de destino: 201 Mercaderías vs 611 Variación de existencias
        createGeneric(
                "COMPRA",
                "201 Mercaderías",                 // Debe
                "611 Variación de existencias",    // Haber
                base,
                "PURCHASE",
                purchaseId,
                descDestino
        );

        // 3️⃣ Asiento de cancelación: 42.1 Proveedores vs 101 Caja (por el TOTAL)
        createGeneric(
                "COMPRA",
                "42.1 Proveedores",    // Debe
                "101 Caja",            // Haber
                total,
                "PURCHASE",
                purchaseId,
                descCancel
        );

        // devolvemos uno cualquiera (el del IGV), el frontend no usa el retorno
        return igvEntry;
    }



    // 👉 Para registrar una VENTA (cuando se completa la venta)
    @Transactional
    public AccountingEntry createForSale(Long saleId, Double total) {
        double base = round2(total / (1 + IGV_RATE));
        double igv  = round2(total - base);

        String descVenta = "Por la venta de mercaderías (venta N° " + saleId + ")";
        String descCobro = "Por el cobro de la venta N° " + saleId;

        // 1️⃣ 121 Facturas por cobrar vs 701 Ventas (BASE)
        createGeneric(
                "VENTA",
                "121 Facturas por cobrar",   // Debe
                "701 Ventas",                // Haber
                base,
                "SALE",
                saleId,
                descVenta
        );

        // 2️⃣ 121 Facturas por cobrar vs 40111 IGV por pagar (IGV)
        AccountingEntry igvEntry = createGeneric(
                "VENTA",
                "121 Facturas por cobrar",      // Debe
                "40111 IGV por pagar",          // Haber
                igv,
                "SALE",
                saleId,
                descVenta     // misma descripción: "Por la venta de mercaderías..."
        );

        // 3️⃣ Cobro de la venta: 101 Caja vs 121 Facturas por cobrar (TOTAL)
        createGeneric(
                "VENTA",
                "101 Caja",                    // Debe
                "121 Facturas por cobrar",     // Haber
                total,
                "SALE",
                saleId,
                descCobro
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

    // 👉 Listado de asientos para un rango (y opcionalmente tipo, búsqueda y montos)
    @Transactional(readOnly = true)
    public List<AccountingEntry> getEntries(
            LocalDate from,
            LocalDate to,
            String type,
            String search,
            Double minAmount,
            Double maxAmount
    ) {
        LocalDateTime fromDt = startOfDay(from);
        LocalDateTime toDt   = endOfDay(to);

        // Primero filtramos por fechas y tipo usando el repositorio
        List<AccountingEntry> baseList;
        if (type == null || type.isBlank()) {
            baseList = repository.findByDateBetween(fromDt, toDt);
        } else {
            baseList = repository.findByTypeAndDateBetween(type.toUpperCase(), fromDt, toDt);
        }

        // Luego aplicamos filtros en memoria (buscar/montos)
        return baseList.stream()
                .filter(e -> {
                    if (search == null || search.isBlank()) return true;
                    String s = search.toLowerCase();
                    return (e.getDebitAccount() != null && e.getDebitAccount().toLowerCase().contains(s))
                            || (e.getCreditAccount() != null && e.getCreditAccount().toLowerCase().contains(s))
                            || (e.getDescription() != null && e.getDescription().toLowerCase().contains(s));
                })
                .filter(e -> {
                    if (minAmount == null) return true;
                    return e.getAmount() != null && e.getAmount() >= minAmount;
                })
                .filter(e -> {
                    if (maxAmount == null) return true;
                    return e.getAmount() != null && e.getAmount() <= maxAmount;
                })
                .collect(Collectors.toList());
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
