package com.example.msinventory.Entity;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "inventory_movements")
public class InventoryMovement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String productSku;
    
    @Column(nullable = false)
    private Integer quantity;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MovementType type; // ENTRADA, SALIDA
    
    private String reference; // ID de compra o venta
    private String reason;
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    public enum MovementType {
        ENTRADA, SALIDA
    }
}