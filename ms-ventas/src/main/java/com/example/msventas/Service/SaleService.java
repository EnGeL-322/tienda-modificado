package com.example.msventas.Service;

import com.example.msventas.Dto.CreateSaleDto;
import com.example.msventas.Dto.CreateSaleItemDto;
import com.example.msventas.Dto.SaleDto;
import com.example.msventas.Dto.SaleItemDto;
import com.example.msventas.Dto.StockUpdateDto;
import com.example.msventas.Entity.Sale;
import com.example.msventas.Entity.SaleItem;
import com.example.msventas.Repository.SaleRepository;
import com.example.msventas.feign.InventoryClient;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SaleService {
    private final SaleRepository saleRepository;
    private final InventoryClient inventoryClient;
    private final com.example.msventas.Repository.CustomerRepository customerRepository;


    @Transactional
    public SaleDto create(CreateSaleDto dto) {
        if (dto.customerId() == null) {
            throw new RuntimeException("customerId es obligatorio");
        }

        var customer = customerRepository.findById(dto.customerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Sale sale = new Sale();
        sale.setCustomer(customer);
        sale.setCustomerName(customer.getName());

        // Permite crear venta vacía (carrito)
        if (dto.items() != null) {
            dto.items().forEach(itemDto -> {
                SaleItem item = new SaleItem();
                item.setSale(sale);
                item.setProductSku(itemDto.productSku());
                item.setQuantity(itemDto.quantity());
                item.setUnitPrice(itemDto.unitPrice());
                item.setUnitType(itemDto.unitType());
                item.setUnitsPerPackage(itemDto.unitsPerPackage());
                sale.getItems().add(item);
            });
        }

        return toDto(saleRepository.save(sale));
    }


    @Transactional
    public SaleDto addItem(Long saleId, CreateSaleItemDto dto) {
        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new RuntimeException("Sale not found"));

        if (sale.getStatus() != SaleItem.SaleStatus.PENDING) {
            throw new IllegalStateException(
                    "Cannot modify sale with status " + sale.getStatus()
            );
        }

        SaleItem item = new SaleItem();
        item.setSale(sale);
        item.setProductSku(dto.productSku());
        item.setQuantity(dto.quantity());
        item.setUnitPrice(dto.unitPrice());
        item.setUnitType(dto.unitType());
        item.setUnitsPerPackage(dto.unitsPerPackage());

        sale.getItems().add(item);

        Sale saved = saleRepository.save(sale);
        return toDto(saved);
    }

    @Transactional
    public SaleDto complete(Long saleId) {
        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new RuntimeException("Sale not found"));

        sale.setStatus(SaleItem.SaleStatus.COMPLETED);
        sale.setCompletedAt(LocalDateTime.now());
        saleRepository.save(sale);

        // Actualizamos inventario en UNIDADES BASE
        sale.getItems().forEach(item -> {
            int unitsPerPackage = item.getUnitsPerPackage() != null ? item.getUnitsPerPackage() : 1;
            int qtyPackages = item.getQuantity() != null ? item.getQuantity() : 0;
            int totalUnits = qtyPackages * unitsPerPackage;

            StockUpdateDto stockUpdate = new StockUpdateDto(
                    item.getProductSku(),
                    totalUnits,
                    StockUpdateDto.MovementType.SALIDA,
                    "SALE-" + saleId,
                    "Venta completada"
            );
            inventoryClient.updateStock(stockUpdate);
        });

        return toDto(sale);
    }

    public SaleDto findById(Long id) {
        return saleRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new RuntimeException("Sale not found"));
    }

    private SaleDto toDto(Sale s) {
        List<SaleItemDto> items = s.getItems().stream()
                .map(i -> new SaleItemDto(
                        i.getId(),
                        i.getProductSku(),
                        i.getQuantity(),
                        i.getUnitPrice(),
                        i.getUnitType(),
                        i.getUnitsPerPackage()
                ))
                .toList();

        Long customerId = null;
        String customerDni = null;
        if (s.getCustomer() != null) {
            customerId = s.getCustomer().getId();
            customerDni = s.getCustomer().getDni();
        }

        return new SaleDto(
                s.getId(),
                customerId,
                s.getCustomerName(),
                customerDni,
                s.getStatus(),
                s.getCreatedAt(),
                s.getCompletedAt(),
                items
        );
    }


    public List<SaleDto> findAll() {
        return saleRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }
}
