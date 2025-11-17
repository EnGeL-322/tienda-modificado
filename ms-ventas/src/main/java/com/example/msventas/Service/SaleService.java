package com.example.msventas.Service;

import com.example.msventas.Dto.CreateSaleDto;
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

    @Transactional
    public SaleDto create(CreateSaleDto dto) {
        Sale sale = new Sale();
        sale.setCustomerName(dto.customerName());
        
        dto.items().forEach(itemDto -> {
            SaleItem item = new SaleItem();
            item.setSale(sale);
            item.setProductSku(itemDto.productSku());
            item.setQuantity(itemDto.quantity());
            item.setUnitPrice(itemDto.unitPrice());
            sale.getItems().add(item);
        });
        
        return toDto(saleRepository.save(sale));
    }

    @Transactional
    public SaleDto complete(Long saleId) {
        Sale sale = saleRepository.findById(saleId)
            .orElseThrow(() -> new RuntimeException("Sale not found"));
        
        sale.setStatus(SaleItem.SaleStatus.COMPLETED);
        sale.setCompletedAt(LocalDateTime.now());
        saleRepository.save(sale);

        sale.getItems().forEach(item -> {
            StockUpdateDto stockUpdate = new StockUpdateDto(
                item.getProductSku(),
                item.getQuantity(),
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
            .map(i -> new SaleItemDto(i.getId(), i.getProductSku(), i.getQuantity(), i.getUnitPrice()))
            .toList();
        return new SaleDto(s.getId(), s.getCustomerName(), s.getStatus(), 
            s.getCreatedAt(), s.getCompletedAt(), items);
    }

    public List<SaleDto> findAll() {
        return saleRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }
}