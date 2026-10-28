package com.ecommerce.platform.modules.inventory.repository;

import com.ecommerce.platform.modules.inventory.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    @Query("SELECT i FROM Inventory i WHERE (i.stockOnHand - i.stockReserved) <= :threshold")
    List<Inventory> findLowStockInventories(int threshold);
}
