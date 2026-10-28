package com.ecommerce.platform.modules.marketing.controller;

import com.ecommerce.platform.common.response.ApiResponse;
import com.ecommerce.platform.modules.marketing.dto.MarketingDto;
import com.ecommerce.platform.modules.marketing.service.MarketingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/marketing")
@RequiredArgsConstructor
@Tag(name = "Public Marketing API", description = "Lấy Banner, Flash Sale đếm ngược và kiểm tra Voucher")
public class PublicMarketingController {

    private final MarketingService marketingService;

    @GetMapping("/banners")
    @Operation(summary = "Lấy danh sách Banner chiến dịch hiển thị trang chủ")
    public ResponseEntity<ApiResponse<List<MarketingDto.BannerDto>>> getBanners() {
        return ResponseEntity.ok(ApiResponse.ok(marketingService.getHomeBanners()));
    }

    @GetMapping("/vouchers")
    @Operation(summary = "Lấy danh sách Voucher công khai")
    public ResponseEntity<ApiResponse<List<MarketingDto.VoucherDto>>> getVouchers() {
        return ResponseEntity.ok(ApiResponse.ok(marketingService.getPublicVouchers()));
    }

    @PostMapping("/vouchers/validate")
    @Operation(summary = "Kiểm tra và tính toán giảm giá của Voucher")
    public ResponseEntity<ApiResponse<MarketingDto.VoucherValidationResult>> validateVoucher(
            @Valid @RequestBody MarketingDto.ValidateVoucherRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(marketingService.validateVoucher(request)));
    }

    @GetMapping("/flash-sale")
    @Operation(summary = "Lấy chiến dịch Flash Sale đang diễn ra kèm danh sách sản phẩm giá sốc")
    public ResponseEntity<ApiResponse<MarketingDto.FlashSaleDto>> getFlashSale() {
        return ResponseEntity.ok(ApiResponse.ok(marketingService.getActiveFlashSale()));
    }
}
