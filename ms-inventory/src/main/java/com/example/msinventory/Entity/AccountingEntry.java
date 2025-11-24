package com.example.msinventory.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "accounting_entries")
public class AccountingEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Fecha del asiento
    @Column(name = "date", nullable = false)
    private LocalDateTime date;

    // COMPRA, VENTA, AJUSTE
    @Column(name = "type", nullable = false, length = 20)
    private String type;

    @Column(name = "debit_account", nullable = false, length = 100)
    private String debitAccount;

    @Column(name = "credit_account", nullable = false, length = 100)
    private String creditAccount;

    @Column(name = "amount", nullable = false)
    private Double amount;

    // SALE, PURCHASE, INVENTORY_ADJUSTMENT, etc
    @Column(name = "reference_type", length = 30)
    private String referenceType;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "description", length = 255)
    private String description;

    // ====== CONSTRUCTORES ======

    public AccountingEntry() {
    }

    public AccountingEntry(
            LocalDateTime date,
            String type,
            String debitAccount,
            String creditAccount,
            Double amount,
            String referenceType,
            Long referenceId,
            String description
    ) {
        this.date = date;
        this.type = type;
        this.debitAccount = debitAccount;
        this.creditAccount = creditAccount;
        this.amount = amount;
        this.referenceType = referenceType;
        this.referenceId = referenceId;
        this.description = description;
    }

    // ====== GETTERS & SETTERS ======

    public Long getId() {
        return id;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDebitAccount() {
        return debitAccount;
    }

    public void setDebitAccount(String debitAccount) {
        this.debitAccount = debitAccount;
    }

    public String getCreditAccount() {
        return creditAccount;
    }

    public void setCreditAccount(String creditAccount) {
        this.creditAccount = creditAccount;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getReferenceType() {
        return referenceType;
    }

    public void setReferenceType(String referenceType) {
        this.referenceType = referenceType;
    }

    public Long getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(Long referenceId) {
        this.referenceId = referenceId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
