package com.example.msventas.Controller;

import com.example.msventas.Dto.CreateCustomerDto;
import com.example.msventas.Dto.CustomerDto;
import com.example.msventas.Dto.TopCustomerDto;
import com.example.msventas.Service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping
    public ResponseEntity<CustomerDto> create(@RequestBody CreateCustomerDto dto) {
        return ResponseEntity.ok(customerService.create(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<CustomerDto>> getAll() {
        return ResponseEntity.ok(customerService.findAll());
    }

    // 🔍 Buscar por DNI
    @GetMapping("/search")
    public ResponseEntity<CustomerDto> searchByDni(@RequestParam String dni) {
        return ResponseEntity.ok(customerService.findByDni(dni));
    }

    // 🏆 Top compradores
    @GetMapping("/top")
    public ResponseEntity<List<TopCustomerDto>> top(
            @RequestParam(defaultValue = "5") int limit
    ) {
        return ResponseEntity.ok(customerService.topCustomers(limit));
    }
}
