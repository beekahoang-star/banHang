package com.ecommerce.platform.modules.analytics.controller;

import com.ecommerce.platform.common.response.ApiResponse;
import com.ecommerce.platform.modules.analytics.dto.AnalyticsDto;
import com.ecommerce.platform.modules.analytics.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/analytics")
@RequiredArgsConstructor
@Tag(name = "Admin Analytics API", description = "Thống kê KPI doanh thu, số đơn, AOV, biểu đồ và cảnh báo tồn kho")
public class AdminAnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('ANALYTICS_READ') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Lấy dữ liệu tổng hợp Dashboard Admin (Doanh thu thuần, AOV, Tỷ lệ hủy, biểu đồ)")
    public ResponseEntity<ApiResponse<AnalyticsDto.DashboardSummaryDto>> getDashboardSummary() {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getDashboardSummary()));
    }
}
