package com.example.mscompras.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "suppliers")
public class Supplier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String ruc;
    private String address;
    private String phone;
    private String email;

    @Column(nullable = false)
    private Boolean active = true;
}
