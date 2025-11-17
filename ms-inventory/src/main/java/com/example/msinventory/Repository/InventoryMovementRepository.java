package com.example.msinventory.Repository;

import com.example.msinventory.Entity.InventoryMovement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {
    List<InventoryMovement> findByProductSkuOrderByCreatedAtDesc(String productSku);
}
