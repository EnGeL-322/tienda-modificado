package com.example.mscatalogo.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String sku;
    
    @Column(nullable = false)
    private String name;

    private String unit;           // unidad base: BOTELLA, UNIDAD, etc.

    private Integer unitsPerBox;   // cuántas unidades trae una caja
    private Integer unitsPerPack;  // opcional, por si quieres "sixpack" u otro

    private String category;
    private String description;
    private Boolean active = true;
}