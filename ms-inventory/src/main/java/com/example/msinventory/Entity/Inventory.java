package com.example.msinventory.Entity;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "inventory")
public class Inventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String productSku;
    
    private String location;
    
    @Column(nullable = false)
    private Integer quantity = 0;
}