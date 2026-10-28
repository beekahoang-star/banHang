package com.ecommerce.platform.modules.marketing.repository;

import com.ecommerce.platform.modules.marketing.entity.FlashSale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface FlashSaleRepository extends JpaRepository<FlashSale, Long> {

    @Query("SELECT fs FROM FlashSale fs LEFT JOIN FETCH fs.items i LEFT JOIN FETCH i.variant v LEFT JOIN FETCH v.product " +
           "WHERE fs.isActive = true AND fs.startTime <= :now AND fs.endTime >= :now")
    Optional<FlashSale> findActiveFlashSale(Instant now);

    List<FlashSale> findByIsActiveTrueOrderByStartTimeDesc();
}
