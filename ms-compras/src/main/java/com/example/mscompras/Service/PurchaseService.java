package com.example.mscompras.Service;

import com.example.mscompras.Dto.CreatePurchaseDto;
import com.example.mscompras.Dto.PurchaseItemDto;
import com.example.mscompras.Dto.PurchaseOrderDto;
import com.example.mscompras.Dto.StockUpdateDto;
import com.example.mscompras.Entity.PurchaseItem;
import com.example.mscompras.Entity.PurchaseOrder;
import com.example.mscompras.Feign.InventoryClient;
import com.example.mscompras.Repository.PurchaseOrderRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PurchaseService {
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final InventoryClient inventoryClient;

    @Transactional
    public PurchaseOrderDto create(CreatePurchaseDto dto) {
        PurchaseOrder order = new PurchaseOrder();
        order.setSupplierName(dto.supplierName());
        
        dto.items().forEach(itemDto -> {
            PurchaseItem item = new PurchaseItem();
            item.setPurchaseOrder(order);
            item.setProductSku(itemDto.productSku());
            item.setQuantity(itemDto.quantity());
            item.setUnitPrice(itemDto.unitPrice());
            order.getItems().add(item);
        });
        
        return toDto(purchaseOrderRepository.save(order));
    }

    @Transactional
    public PurchaseOrderDto receive(Long orderId) {
        PurchaseOrder order = purchaseOrderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Purchase order not found"));
        
        order.setStatus(PurchaseOrder.PurchaseStatus.RECEIVED);
        order.setReceivedAt(LocalDateTime.now());
        purchaseOrderRepository.save(order);

        order.getItems().forEach(item -> {
            StockUpdateDto stockUpdate = new StockUpdateDto(
                item.getProductSku(),
                item.getQuantity(),
                StockUpdateDto.MovementType.ENTRADA,
                "PURCHASE-" + orderId,
                "Recepción de compra"
            );
            inventoryClient.updateStock(stockUpdate);
        });

        return toDto(order);
    }

    public PurchaseOrderDto findById(Long id) {
        return purchaseOrderRepository.findById(id)
            .map(this::toDto)
            .orElseThrow(() -> new RuntimeException("Purchase order not found"));
    }

    public List<PurchaseOrderDto> findAll() {
        return purchaseOrderRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    private PurchaseOrderDto toDto(PurchaseOrder p) {
        List<PurchaseItemDto> items = p.getItems().stream()
                .map(i -> new PurchaseItemDto(
                        i.getId(),
                        i.getProductSku(),
                        i.getQuantity(),
                        i.getUnitPrice()
                ))
                .toList();

        return new PurchaseOrderDto(
                p.getId(),
                p.getSupplierName(),
                p.getStatus(),
                p.getCreatedAt(),
                p.getReceivedAt(),
                items
        );
    }
}