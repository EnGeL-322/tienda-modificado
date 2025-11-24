package com.example.mscompras.Service;

import com.example.mscompras.Dto.*;
import com.example.mscompras.Entity.PurchaseItem;
import com.example.mscompras.Entity.PurchaseOrder;
import com.example.mscompras.Entity.Supplier;
import com.example.mscompras.Feign.AccountingClient;
import com.example.mscompras.Feign.InventoryClient;
import com.example.mscompras.Repository.PurchaseOrderRepository;
import com.example.mscompras.Repository.SupplierRepository;
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
    private final SupplierRepository supplierRepository;
    private final AccountingClient accountingClient;

    @Transactional
    public PurchaseOrderDto create(CreatePurchaseDto dto) {
        if (dto.supplierId() == null) {
            throw new RuntimeException("supplierId es obligatorio");
        }

        Supplier supplier = supplierRepository.findById(dto.supplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        PurchaseOrder order = new PurchaseOrder();
        order.setSupplier(supplier);

        // Permite crear orden vacía (carrito)
        if (dto.items() != null) {
            dto.items().forEach(itemDto -> {
                PurchaseItem item = new PurchaseItem();
                item.setPurchaseOrder(order);
                item.setProductSku(itemDto.productSku());
                item.setQuantity(itemDto.quantity());
                item.setUnitPrice(itemDto.unitPrice());
                item.setUnitType(itemDto.unitType());
                item.setUnitsPerPackage(itemDto.unitsPerPackage());
                order.getItems().add(item);
            });
        }

        return toDto(purchaseOrderRepository.save(order));
    }

    @Transactional
    public PurchaseOrderDto addItem(Long orderId, CreatePurchaseItemDto dto) {
        PurchaseOrder order = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Purchase order not found"));

        if (order.getStatus() != PurchaseOrder.PurchaseStatus.PENDING) {
            throw new IllegalStateException(
                    "Cannot modify purchase order with status " + order.getStatus()
            );
        }

        PurchaseItem item = new PurchaseItem();
        item.setPurchaseOrder(order);
        item.setProductSku(dto.productSku());
        item.setQuantity(dto.quantity());
        item.setUnitPrice(dto.unitPrice());
        item.setUnitType(dto.unitType());
        item.setUnitsPerPackage(dto.unitsPerPackage());

        order.getItems().add(item);

        PurchaseOrder saved = purchaseOrderRepository.save(order);
        return toDto(saved);
    }

    @Transactional
    public PurchaseOrderDto receive(Long orderId) {
        PurchaseOrder order = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Purchase order not found"));

        order.setStatus(PurchaseOrder.PurchaseStatus.RECEIVED);
        order.setReceivedAt(LocalDateTime.now());
        purchaseOrderRepository.save(order);

        // Actualizamos inventario en UNIDADES BASE
        order.getItems().forEach(item -> {
            int unitsPerPackage = item.getUnitsPerPackage() != null ? item.getUnitsPerPackage() : 1;
            int qtyPackages = item.getQuantity() != null ? item.getQuantity() : 0;
            int totalUnits = qtyPackages * unitsPerPackage;

            StockUpdateDto stockUpdate = new StockUpdateDto(
                    item.getProductSku(),
                    totalUnits,
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
                        i.getUnitPrice(),
                        i.getUnitType(),
                        i.getUnitsPerPackage()
                ))
                .toList();

        Supplier s = p.getSupplier();
        Long supplierId = s != null ? s.getId() : null;
        String supplierName = s != null ? s.getName() : null;

        return new PurchaseOrderDto(
                p.getId(),
                supplierId,
                supplierName,
                p.getStatus(),
                p.getCreatedAt(),
                p.getReceivedAt(),
                items
        );
    }
}
