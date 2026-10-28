package com.ecommerce.platform.modules.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

public class AnalyticsDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardSummaryDto {
        private BigDecimal netRevenue;
        private long totalOrders;
        private BigDecimal averageOrderValue; // AOV
        private double cancellationRate; // %
        private long lowStockCount;
        private List<RevenueChartPoint> revenueChart;
        private List<CategoryRevenueDto> categoryRevenue;
        private List<LowStockAlertDto> lowStockAlerts;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueChartPoint {
        private String date; // e.g. "T2", "T3", or "2026-10-21"
        private BigDecimal revenue;
        private long orderCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryRevenueDto {
        private String categoryName;
        private BigDecimal revenue;
        private double percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LowStockAlertDto {
        private Long variantId;
        private String skuCode;
        private String productName;
        private Integer stockOnHand;
        private Integer stockReserved;
        private Integer availableStock;
    }
}
