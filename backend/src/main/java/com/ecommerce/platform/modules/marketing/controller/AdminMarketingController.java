package com.ecommerce.platform.modules.marketing.controller;

import com.ecommerce.platform.common.response.ApiResponse;
import com.ecommerce.platform.modules.marketing.dto.MarketingDto;
import com.ecommerce.platform.modules.marketing.service.MarketingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/marketing")
@RequiredArgsConstructor
@Tag(name = "Admin Marketing API", description = "Quản lý tạo Voucher, cấu hình Flash Sale, Banner CMS")
public class AdminMarketingController {

    private final MarketingService marketingService;

    @PostMapping("/vouchers")
    @PreAuthorize("hasAuthority('MARKETING_WRITE') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Tạo mới mã Voucher giảm giá")
    public ResponseEntity<ApiResponse<MarketingDto.VoucherDto>> createVoucher(
            @Valid @RequestBody MarketingDto.CreateVoucherRequest request) {
        MarketingDto.VoucherDto voucher = marketingService.createVoucher(request);
        return ResponseEntity.ok(ApiResponse.ok("Tạo Voucher thành công", voucher));
    }
}
