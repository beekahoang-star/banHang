package com.ecommerce.platform.modules.inventory.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

public class InventoryDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InventorySummaryDto {
        private Long variantId;
        private String skuCode;
        private String productName;
        private String options;
        private BigDecimal price;
        private Integer stockOnHand;
        private Integer stockReserved;
        private Integer availableStock;
        private Long version;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RestockRequest {
        @NotNull(message = "Mã biến thể SKU không được để trống")
        private Long variantId;

        @NotNull(message = "Số lượng nhập không được để trống")
        private Integer quantity;

        private String note;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdjustStockRequest {
        @NotNull(message = "Mã biến thể SKU không được để trống")
        private Long variantId;

        @NotNull(message = "Số lượng tồn thực tế mới không được để trống")
        private Integer newStockOnHand;

        private String note;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InventoryLogDto {
        private Long id;
        private Long variantId;
        private String skuCode;
        private String changeType;
        private Integer quantityChanged;
        private Integer stockOnHandAfter;
        private Integer stockReservedAfter;
        private String referenceType;
        private String referenceId;
        private String note;
        private String createdByName;
        private Instant createdAt;
    }
}
