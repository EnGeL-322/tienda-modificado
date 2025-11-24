package com.example.msventas.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // DNI único
    @Column(nullable = false, unique = true, length = 20)
    private String dni;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 50)
    private String phone;

}
