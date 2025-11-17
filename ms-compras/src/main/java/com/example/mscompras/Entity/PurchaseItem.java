package com.example.mscompras.Entity;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "purchase_items")
public class PurchaseItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "purchase_order_id")
    private PurchaseOrder purchaseOrder;
    
    @Column(nullable = false)
    private String productSku;
    
    @Column(nullable = false)
    private Integer quantity;
    
    private Double unitPrice;
}