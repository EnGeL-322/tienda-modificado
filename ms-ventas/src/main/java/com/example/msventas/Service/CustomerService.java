package com.example.msventas.Service;

import com.example.msventas.Dto.CreateCustomerDto;
import com.example.msventas.Dto.CustomerDto;
import com.example.msventas.Dto.TopCustomerDto;
import com.example.msventas.Entity.Customer;
import com.example.msventas.Repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerDto create(CreateCustomerDto dto) {
        if (dto.dni() == null || dto.dni().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "DNI es obligatorio");
        }
        if (dto.name() == null || dto.name().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nombre es obligatorio");
        }

        customerRepository.findByDni(dto.dni()).ifPresent(c -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un cliente con ese DNI");
        });

        Customer c = new Customer();
        c.setDni(dto.dni());
        c.setName(dto.name());
        c.setPhone(dto.phone());


        return toDto(customerRepository.save(c));
    }

    public CustomerDto findById(Long id) {
        Customer c = customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));
        return toDto(c);
    }

    public CustomerDto findByDni(String dni) {
        Customer c = customerRepository.findByDni(dni)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));
        return toDto(c);
    }

    public List<CustomerDto> findAll() {
        return customerRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    public List<TopCustomerDto> topCustomers(int limit) {
        var pageable = PageRequest.of(0, limit);
        return customerRepository.findTopCustomers(pageable)
                .stream()
                .map(p -> new TopCustomerDto(
                        p.getCustomerId(),
                        p.getDni(),
                        p.getName(),
                        p.getTotalSales()
                ))
                .toList();
    }

    private CustomerDto toDto(Customer c) {
        return new CustomerDto(
                c.getId(),
                c.getDni(),
                c.getName(),
                c.getPhone()
        );
    }
}
