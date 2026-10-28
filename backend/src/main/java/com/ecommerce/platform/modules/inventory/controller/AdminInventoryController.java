package com.ecommerce.platform.modules.inventory.controller;

import com.ecommerce.platform.common.response.ApiResponse;
import com.ecommerce.platform.common.security.UserPrincipal;
import com.ecommerce.platform.modules.inventory.dto.InventoryDto;
import com.ecommerce.platform.modules.inventory.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/inventory")
@RequiredArgsConstructor
@Tag(name = "Admin Inventory API", description = "Quản lý tồn thực tế vs tồn giữ, nhập/xuất kho và tra cứu thẻ kho")
public class AdminInventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/summary")
    @PreAuthorize("hasAuthority('INVENTORY_READ') or hasRole('SUPER_ADMIN') or hasRole('WAREHOUSE_MANAGER')")
    @Operation(summary = "Xem tổng quan tồn kho toàn bộ SKU (tồn thực, tồn giữ, tồn khả dụng)")
    public ResponseEntity<ApiResponse<List<InventoryDto.InventorySummaryDto>>> getAllInventories() {
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.getAllInventories()));
    }

    @GetMapping("/logs")
    @PreAuthorize("hasAuthority('INVENTORY_READ') or hasRole('SUPER_ADMIN') or hasRole('WAREHOUSE_MANAGER')")
    @Operation(summary = "Tra cứu nhật ký biến động thẻ kho (Audit logs)")
    public ResponseEntity<ApiResponse<List<InventoryDto.InventoryLogDto>>> getInventoryLogs() {
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.getRecentLogs()));
    }

    @PostMapping("/restock")
    @PreAuthorize("hasAuthority('INVENTORY_WRITE') or hasRole('SUPER_ADMIN') or hasRole('WAREHOUSE_MANAGER')")
    @Operation(summary = "Tạo phiếu nhập kho bổ sung hàng")
    public ResponseEntity<ApiResponse<InventoryDto.InventorySummaryDto>> restock(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody InventoryDto.RestockRequest request) {
        InventoryDto.InventorySummaryDto result = inventoryService.restock(request, currentUser != null ? currentUser.getId() : null);
        return ResponseEntity.ok(ApiResponse.ok("Nhập kho thành công", result));
    }

    @PostMapping("/adjust")
    @PreAuthorize("hasAuthority('INVENTORY_WRITE') or hasRole('SUPER_ADMIN') or hasRole('WAREHOUSE_MANAGER')")
    @Operation(summary = "Điều chỉnh số lượng tồn kho thực tế sau kiểm kê")
    public ResponseEntity<ApiResponse<InventoryDto.InventorySummaryDto>> adjustStock(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody InventoryDto.AdjustStockRequest request) {
        InventoryDto.InventorySummaryDto result = inventoryService.adjustStock(request, currentUser != null ? currentUser.getId() : null);
        return ResponseEntity.ok(ApiResponse.ok("Điều chỉnh tồn kho thành công", result));
    }
}
