package com.ecommerce.platform.modules.catalog.repository;

import com.ecommerce.platform.modules.catalog.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    Optional<ProductVariant> findBySkuCode(String skuCode);
    List<ProductVariant> findByProductId(Long productId);

    @Query("SELECT v FROM ProductVariant v LEFT JOIN FETCH v.inventory WHERE v.id = :id")
    Optional<ProductVariant> findByIdWithInventory(@Param("id") Long id);

    @Query("SELECT v FROM ProductVariant v LEFT JOIN FETCH v.inventory WHERE v.id IN :ids")
    List<ProductVariant> findByIdsWithInventory(@Param("ids") List<Long> ids);
}
