package com.ecommerce.platform.modules.ordering.repository;

import com.ecommerce.platform.modules.ordering.entity.RmaRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RmaRequestRepository extends JpaRepository<RmaRequest, Long> {
    List<RmaRequest> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<RmaRequest> findByOrderId(Long orderId);
}
