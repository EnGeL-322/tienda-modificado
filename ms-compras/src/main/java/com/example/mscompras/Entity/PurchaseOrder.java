package com.example.mscompras.Entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "purchase_orders")
public class PurchaseOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔹 RELACIÓN CON SUPPLIER (FOREIGN KEY)
    @ManyToOne
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PurchaseStatus status = PurchaseStatus.PENDING;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime receivedAt;

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL)
    private List<PurchaseItem> items = new ArrayList<>();

    public enum PurchaseStatus {
        PENDING, RECEIVED, CANCELLED
    }

    public Double getTotalAmount() {
        return this.items.stream()
                .mapToDouble(item -> item.getUnitPrice() * item.getQuantity()) // Precio * cantidad por item
                .sum(); // Suma total
    }

}
