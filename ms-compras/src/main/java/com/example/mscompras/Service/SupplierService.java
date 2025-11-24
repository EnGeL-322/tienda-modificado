package com.example.mscompras.Service;

import com.example.mscompras.Dto.CreateSupplierDto;
import com.example.mscompras.Dto.SupplierDto;
import com.example.mscompras.Entity.Supplier;
import com.example.mscompras.Repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public SupplierDto create(CreateSupplierDto dto) {
        Supplier s = new Supplier();
        s.setName(dto.name());
        s.setRuc(dto.ruc());
        s.setAddress(dto.address());
        s.setPhone(dto.phone());
        s.setEmail(dto.email());
        s.setActive(true);
        return toDto(supplierRepository.save(s));
    }

    public SupplierDto findById(Long id) {
        return supplierRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));
    }

    public List<SupplierDto> findAll() {
        return supplierRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    public SupplierDto update(Long id, CreateSupplierDto dto) {
        Supplier s = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        s.setName(dto.name());
        s.setRuc(dto.ruc());
        s.setAddress(dto.address());
        s.setPhone(dto.phone());
        s.setEmail(dto.email());

        return toDto(supplierRepository.save(s));
    }

    public SupplierDto changeActive(Long id, Boolean active) {
        Supplier s = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));
        s.setActive(active != null ? active : !Boolean.TRUE.equals(s.getActive()));
        return toDto(supplierRepository.save(s));
    }

    private SupplierDto toDto(Supplier s) {
        return new SupplierDto(
                s.getId(),
                s.getName(),
                s.getRuc(),
                s.getAddress(),
                s.getPhone(),
                s.getEmail(),
                s.getActive()
        );
    }
}
