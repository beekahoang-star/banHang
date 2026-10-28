package com.ecommerce.platform.modules.ordering.controller;

import com.ecommerce.platform.common.response.ApiResponse;
import com.ecommerce.platform.common.response.PageResponse;
import com.ecommerce.platform.common.security.UserPrincipal;
import com.ecommerce.platform.modules.ordering.dto.OrderDto;
import com.ecommerce.platform.modules.ordering.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
@Tag(name = "Admin Orders API", description = "Quản lý đơn hàng, điều khiển Order State Machine, giao vận và hoàn trả")
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    @PreAuthorize("hasAuthority('ORDER_READ') or hasRole('SUPER_ADMIN') or hasRole('CUSTOMER_SERVICE')")
    @Operation(summary = "Lấy danh sách tất cả đơn hàng (phân trang & trạng thái)")
    public ResponseEntity<ApiResponse<PageResponse<OrderDto.OrderResponse>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getAllOrders(page, size)));
    }

    @GetMapping("/{orderCode}")
    @PreAuthorize("hasAuthority('ORDER_READ') or hasRole('SUPER_ADMIN') or hasRole('CUSTOMER_SERVICE')")
    @Operation(summary = "Xem chi tiết đơn hàng quản trị")
    public ResponseEntity<ApiResponse<OrderDto.OrderResponse>> getOrderDetail(@PathVariable String orderCode) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getOrderByCode(orderCode)));
    }

    @PatchMapping("/{orderId}/status")
    @PreAuthorize("hasAuthority('ORDER_WRITE') or hasRole('SUPER_ADMIN') or hasRole('CUSTOMER_SERVICE')")
    @Operation(summary = "Chuyển trạng thái đơn hàng (Order State Machine)")
    public ResponseEntity<ApiResponse<OrderDto.OrderResponse>> updateOrderStatus(
            @PathVariable Long orderId,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody OrderDto.UpdateOrderStatusRequest request) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        OrderDto.OrderResponse order = orderService.updateOrderStatus(orderId, request, userId);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật trạng thái đơn thành công", order));
    }
}
