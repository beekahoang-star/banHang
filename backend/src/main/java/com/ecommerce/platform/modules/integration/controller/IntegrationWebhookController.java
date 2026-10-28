package com.ecommerce.platform.modules.integration.controller;

import com.ecommerce.platform.common.response.ApiResponse;
import com.ecommerce.platform.modules.integration.dto.IntegrationDto;
import com.ecommerce.platform.modules.integration.service.PaymentIntegrationService;
import com.ecommerce.platform.modules.integration.service.ShippingIntegrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
@Tag(name = "Integration & Webhook API", description = "Tạo VietQR, webhook xác nhận thanh toán tự động và tra cước vận chuyển GHN/GHTK")
public class IntegrationWebhookController {

    private final PaymentIntegrationService paymentIntegrationService;
    private final ShippingIntegrationService shippingIntegrationService;

    @GetMapping("/integration/vietqr/{orderCode}")
    @Operation(summary = "Lấy link mã QR chuyển khoản VietQR Napas 247 cho đơn hàng")
    public ResponseEntity<ApiResponse<IntegrationDto.VietQrResponse>> getVietQr(@PathVariable String orderCode) {
        return ResponseEntity.ok(ApiResponse.ok(paymentIntegrationService.generateVietQr(orderCode)));
    }

    @PostMapping("/webhooks/payment")
    @Operation(summary = "Webhook tự động nhận tín hiệu thanh toán từ cổng thanh toán/ngân hàng")
    public ResponseEntity<ApiResponse<String>> handlePaymentWebhook(@RequestBody IntegrationDto.PaymentWebhookRequest request) {
        paymentIntegrationService.processPaymentWebhook(request);
        return ResponseEntity.ok(ApiResponse.ok("Xử lý webhook thanh toán thành công", "SUCCESS"));
    }

    @GetMapping("/integration/shipping/rates")
    @Operation(summary = "Tính cước vận chuyển thời gian thực từ GHN / GHTK")
    public ResponseEntity<ApiResponse<List<IntegrationDto.ShippingRateResponse>>> getShippingRates(
            @RequestParam(required = false, defaultValue = "Hồ Chí Minh") String province,
            @RequestParam(required = false, defaultValue = "500") int weightGrams) {
        return ResponseEntity.ok(ApiResponse.ok(shippingIntegrationService.calculateShippingRates(province, weightGrams)));
    }
}
