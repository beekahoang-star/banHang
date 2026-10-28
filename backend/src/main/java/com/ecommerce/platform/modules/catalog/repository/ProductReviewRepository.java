package com.ecommerce.platform.modules.catalog.repository;

import com.ecommerce.platform.modules.catalog.entity.ProductReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {
    Page<ProductReview> findByProductIdAndIsVisibleTrueOrderByCreatedAtDesc(Long productId, Pageable pageable);
    List<ProductReview> findByProductIdAndIsVisibleTrueOrderByCreatedAtDesc(Long productId);
}
