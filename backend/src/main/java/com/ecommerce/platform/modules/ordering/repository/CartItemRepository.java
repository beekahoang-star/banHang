package com.ecommerce.platform.modules.ordering.repository;

import com.ecommerce.platform.modules.ordering.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCartIdAndVariantId(Long cartId, Long variantId);
    void deleteByCartId(Long cartId);
}
