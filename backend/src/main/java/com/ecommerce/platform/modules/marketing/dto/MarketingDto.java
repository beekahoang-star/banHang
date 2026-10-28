package com.ecommerce.platform.modules.marketing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class MarketingDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VoucherDto {
        private Long id;
        private String code;
        private String title;
        private String discountType; // PERCENTAGE, FIXED_AMOUNT
        private BigDecimal discountValue;
        private BigDecimal minOrderValue;
        private BigDecimal maxDiscountAmount;
        private Integer usageLimit;
        private Integer usedCount;
        private Instant startDate;
        private Instant endDate;
        private Boolean isActive;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateVoucherRequest {
        @NotBlank(message = "Mã voucher không được để trống")
        private String code;

        @NotBlank(message = "Tiêu đề voucher không được để trống")
        private String title;

        @NotBlank(message = "Loại giảm giá không được để trống")
        private String discountType;

        @NotNull(message = "Giá trị giảm không được để trống")
        private BigDecimal discountValue;

        private BigDecimal minOrderValue;
        private BigDecimal maxDiscountAmount;
        private Integer usageLimit;
        private Instant startDate;
        private Instant endDate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ValidateVoucherRequest {
        @NotBlank(message = "Mã voucher không được để trống")
        private String code;

        @NotNull(message = "Tổng tiền sản phẩm không được để trống")
        private BigDecimal totalProductAmount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VoucherValidationResult {
        private boolean valid;
        private String message;
        private String code;
        private BigDecimal discountAmount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FlashSaleDto {
        private Long id;
        private String name;
        private Instant startTime;
        private Instant endTime;
        private List<FlashSaleItemDto> items;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FlashSaleItemDto {
        private Long variantId;
        private String skuCode;
        private String productName;
        private String productSlug;
        private String imageUrl;
        private BigDecimal originalPrice;
        private BigDecimal flashPrice;
        private Integer quantityLimit;
        private Integer soldCount;
        private Integer discountPercent;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BannerDto {
        private Long id;
        private String title;
        private String imageUrl;
        private String linkUrl;
        private String position;
        private Integer sortOrder;
    }
}
