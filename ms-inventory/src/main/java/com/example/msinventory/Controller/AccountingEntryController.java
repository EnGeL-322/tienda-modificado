package com.example.msinventory.Controller;

import com.example.msinventory.Dto.AccountBalanceResponse;
import com.example.msinventory.Dto.AccountingSummaryResponse;
import com.example.msinventory.Entity.AccountingEntry;
import com.example.msinventory.Service.AccountingEntryService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/accounting")
public class AccountingEntryController {

    private final AccountingEntryService service;

    public AccountingEntryController(AccountingEntryService service) {
        this.service = service;
    }

    // ====== DTOs para requests desde otros microservicios ======

    public record PurchaseEntryRequest(Long purchaseId, Double amount) {}
    public record SaleEntryRequest(Long saleId, Double amount) {}
    public record AdjustmentRequest(
            String debitAccount,
            String creditAccount,
            Double amount,
            String description
    ) {}

    // ================== CREACIÓN DE ASIENTOS ==================

    // Desde ms-compras
    @PostMapping("/purchase")
    public ResponseEntity<?> createFromPurchase(@RequestBody PurchaseEntryRequest req) {
        if (req.purchaseId() == null || req.amount() == null || req.amount() <= 0) {
            return ResponseEntity.badRequest().body("purchaseId y amount son obligatorios y amount > 0");
        }
        var entry = service.createForPurchase(req.purchaseId(), req.amount());
        return ResponseEntity.ok(entry);
    }

    // Desde ms-ventas
    @PostMapping("/sale")
    public ResponseEntity<?> createFromSale(@RequestBody SaleEntryRequest req) {
        if (req.saleId() == null || req.amount() == null || req.amount() <= 0) {
            return ResponseEntity.badRequest().body("saleId y amount son obligatorios y amount > 0");
        }
        var entry = service.createForSale(req.saleId(), req.amount());
        return ResponseEntity.ok(entry);
    }

    // Ajustes manuales (por ejemplo mermas, ajustes de inventario)
    @PostMapping("/adjustment")
    public ResponseEntity<?> createAdjustment(@RequestBody AdjustmentRequest req) {
        if (req.debitAccount() == null || req.debitAccount().isBlank()
                || req.creditAccount() == null || req.creditAccount().isBlank()
                || req.amount() == null || req.amount() <= 0) {
            return ResponseEntity.badRequest().body("debitAccount, creditAccount y amount (> 0) son obligatorios");
        }
        var entry = service.createAdjustment(
                req.debitAccount(),
                req.creditAccount(),
                req.amount(),
                req.description()
        );
        return ResponseEntity.ok(entry);
    }

    // ================== CONSULTAS / RESÚMENES ==================

    // 👉 RESUMEN GENERAL (para Dashboard)
    //
    // GET /api/accounting/summary?from=2025-01-01&to=2025-01-31
    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(
            @RequestParam("from")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,
            @RequestParam("to")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to
    ) {
        if (from.isAfter(to)) {
            return ResponseEntity.badRequest().body("La fecha 'from' no puede ser mayor que 'to'");
        }
        AccountingSummaryResponse summary = service.getSummary(from, to);
        return ResponseEntity.ok(summary);
    }

    // 👉 LISTADO DE ASIENTOS EN UN RANGO (para tabla en Dashboard o pantalla contable)
    //
    // GET /api/accounting/entries?from=2025-01-01&to=2025-01-31&type=VENTA
    // type es opcional (COMPRA / VENTA / AJUSTE)
    @GetMapping("/entries")
    public ResponseEntity<?> getEntries(
            @RequestParam("from")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,
            @RequestParam("to")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to,
            @RequestParam(value = "type", required = false)
            String type
    ) {
        if (from.isAfter(to)) {
            return ResponseEntity.badRequest().body("La fecha 'from' no puede ser mayor que 'to'");
        }
        List<AccountingEntry> entries = service.getEntries(from, to, type);
        return ResponseEntity.ok(entries);
    }

    // 👉 SALDO POR CUENTA (Inventarios, Caja, Ventas, Proveedores, etc.)
    //
    // GET /api/accounting/account-balance?account=Inventarios&from=2025-01-01&to=2025-01-31
    @GetMapping("/account-balance")
    public ResponseEntity<?> getAccountBalance(
            @RequestParam("account") String account,
            @RequestParam("from")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,
            @RequestParam("to")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to
    ) {
        if (account == null || account.isBlank()) {
            return ResponseEntity.badRequest().body("El parámetro 'account' es obligatorio");
        }
        if (from.isAfter(to)) {
            return ResponseEntity.badRequest().body("La fecha 'from' no puede ser mayor que 'to'");
        }

        AccountBalanceResponse balance = service.getAccountBalance(from, to, account);
        return ResponseEntity.ok(balance);
    }

    // 👉 Asiento por ID
    //
    // GET /api/accounting/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable("id") Long id) {
        var entry = service.getById(id);
        if (entry == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(entry);
    }

    // 👉 Asientos por referencia
    //
    // Ej:
    //   GET /api/accounting/by-reference?type=SALE&id=10
    //   GET /api/accounting/by-reference?type=PURCHASE&id=5
    @GetMapping("/by-reference")
    public ResponseEntity<?> getByReference(
            @RequestParam("type") String referenceType,
            @RequestParam("id") Long referenceId
    ) {
        if (referenceType == null || referenceType.isBlank() || referenceId == null) {
            return ResponseEntity.badRequest().body("type e id son obligatorios");
        }
        var list = service.getByReference(referenceType, referenceId);
        return ResponseEntity.ok(list);
    }
}
