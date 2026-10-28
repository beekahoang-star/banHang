package com.ecommerce.platform.modules.ordering.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class OrderDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateOrderRequest {
        @NotNull(message = "Địa chỉ nhận hàng không được để trống")
        private ShippingAddressDto shippingAddress;

        @NotEmpty(message = "Danh sách sản phẩm mua không được để trống")
        private List<OrderItemRequest> items;

        private String paymentMethod = "COD"; // COD, VIETQR, VNPAY

        private String voucherCode;

        private String customerNote;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemRequest {
        @NotNull(message = "Mã biến thể sản phẩm không được để trống")
        private Long variantId;

        @NotNull(message = "Số lượng không được để trống")
        private Integer quantity;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShippingAddressDto {
        private String receiverName;
        private String phone;
        private String province;
        private String district;
        private String ward;
        private String detailAddress;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderResponse {
        private Long id;
        private String orderCode;
        private Long userId;
        private String customerName;
        private String customerEmail;
        private String status;
        private String paymentMethod;
        private String paymentStatus;
        private String paymentTransactionId;
        private BigDecimal totalProductAmount;
        private BigDecimal shippingFee;
        private BigDecimal discountAmount;
        private BigDecimal finalAmount;
        private String shippingCarrier;
        private String trackingCode;
        private ShippingAddressDto shippingAddress;
        private String customerNote;
        private String cancelReason;
        private Instant createdAt;
        private List<OrderItemResponse> items;
        private List<TimelineResponse> timelines;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemResponse {
        private Long id;
        private Long variantId;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
        private String variantSnapshot; // JSON string
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimelineResponse {
        private String fromStatus;
        private String toStatus;
        private String changedByName;
        private String note;
        private Instant createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateOrderStatusRequest {
        @NotNull(message = "Trạng thái mới không được để trống")
        private String newStatus;

        private String note;
        private String cancelReason;
        private String shippingCarrier;
        private String trackingCode;
    }

    // --- Cart DTOs ---

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddToCartRequest {
        @NotNull(message = "Biến thể sản phẩm không được để trống")
        private Long variantId;

        @NotNull(message = "Số lượng không được để trống")
        private Integer quantity;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateCartItemRequest {
        @NotNull(message = "Số lượng không được để trống")
        private Integer quantity;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartDto {
        private Long cartId;
        private List<CartItemDto> items;
        private BigDecimal totalAmount;
        private Integer totalItems;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartItemDto {
        private Long id;
        private Long variantId;
        private String skuCode;
        private String productName;
        private String productSlug;
        private String options;
        private String imageUrl;
        private BigDecimal price;
        private BigDecimal salePrice;
        private Integer quantity;
        private BigDecimal subtotal;
        private Integer availableStock;
    }

    // --- RMA DTOs ---

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRmaRequest {
        @NotNull(message = "Mã đơn hàng không được để trống")
        private Long orderId;

        @NotNull(message = "Lý do đổi trả không được để trống")
        private String reason;

        private List<String> images;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RmaResponse {
        private Long id;
        private Long orderId;
        private String orderCode;
        private String status;
        private String reason;
        private BigDecimal refundAmount;
        private String images;
        private String adminNote;
        private Instant createdAt;
    }
}
