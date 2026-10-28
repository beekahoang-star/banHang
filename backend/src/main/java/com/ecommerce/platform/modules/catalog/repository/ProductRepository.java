package com.ecommerce.platform.modules.catalog.repository;

import com.ecommerce.platform.modules.catalog.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Optional<Product> findBySlug(String slug);

    @Query("SELECT p FROM Product p " +
            "LEFT JOIN FETCH p.variants v " +
            "LEFT JOIN FETCH v.inventory " +
            "WHERE p.slug = :slug AND p.status = 'ACTIVE'")
    Optional<Product> findBySlugWithVariantsAndInventory(@Param("slug") String slug);

    @Query("SELECT p FROM Product p " +
            "LEFT JOIN FETCH p.variants v " +
            "LEFT JOIN FETCH v.inventory " +
            "WHERE p.id = :id")
    Optional<Product> findByIdWithVariantsAndInventory(@Param("id") Long id);

    Page<Product> findByStatus(String status, Pageable pageable);
}
