package com.ecommerce.platform.modules.ordering.service;

import com.ecommerce.platform.common.exception.AppException;
import com.ecommerce.platform.common.exception.ErrorCode;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;

@Component
public class OrderStateMachine {

    // Transition graph: Current Status -> Set of allowed Target Statuses
    private static final Map<String, Set<String>> VALID_TRANSITIONS = Map.of(
            "PENDING", Set.of("CONFIRMED", "CANCELLED"),
            "CONFIRMED", Set.of("PACKING", "CANCELLED"),
            "PACKING", Set.of("SHIPPING", "CANCELLED"),
            "SHIPPING", Set.of("DELIVERED", "RETURNED"),
            "DELIVERED", Set.of("RETURNED"),
            "CANCELLED", Set.of(),
            "RETURNED", Set.of()
    );

    public boolean canTransition(String currentStatus, String targetStatus) {
        if (currentStatus == null || targetStatus == null) return false;
        Set<String> allowed = VALID_TRANSITIONS.get(currentStatus.toUpperCase());
        return allowed != null && allowed.contains(targetStatus.toUpperCase());
    }

    public void validateTransition(String currentStatus, String targetStatus) {
        if (!canTransition(currentStatus, targetStatus)) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATE_TRANSITION,
                    "Không thể chuyển trạng thái đơn hàng từ [" + currentStatus + "] sang [" + targetStatus + "].");
        }
    }
}
