package com.ecommerce.platform.modules.integration.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

public class IntegrationDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VietQrResponse {
        private String qrImageUrl;
        private String bankId;
        private String accountNo;
        private String accountName;
        private BigDecimal amount;
        private String transferContent; // e.g. ORD-2410271234
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentWebhookRequest {
        private String orderCode;
        private BigDecimal amount;
        private String transactionId;
        private String secureHash;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShippingRateResponse {
        private String carrier; // GHN, GHTK
        private BigDecimal fee;
        private String estimatedDelivery;
    }
}
