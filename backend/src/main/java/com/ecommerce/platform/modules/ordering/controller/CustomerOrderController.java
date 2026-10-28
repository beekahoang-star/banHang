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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/customer/orders")
@RequiredArgsConstructor
@Tag(name = "Customer Orders API", description = "Tạo đơn hàng, theo dõi Order Timeline và khiếu nại đổi trả RMA")
public class CustomerOrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    @Operation(summary = "Tạo đơn hàng mới (Checkout) & Giữ tồn kho (Reserve Stock)")
    public ResponseEntity<ApiResponse<OrderDto.OrderResponse>> createOrder(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody OrderDto.CreateOrderRequest request) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        OrderDto.OrderResponse order = orderService.createOrder(userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Đặt hàng thành công", order));
    }

    @GetMapping
    @Operation(summary = "Xem lịch sử đơn hàng của tôi")
    public ResponseEntity<ApiResponse<PageResponse<OrderDto.OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getCustomerOrders(currentUser.getId(), page, size)));
    }

    @GetMapping("/{orderCode}")
    @Operation(summary = "Xem chi tiết tiến trình đơn hàng (Order Timeline)")
    public ResponseEntity<ApiResponse<OrderDto.OrderResponse>> getOrderDetail(@PathVariable String orderCode) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getOrderByCode(orderCode)));
    }

    @PostMapping("/rma")
    @Operation(summary = "Gửi yêu cầu đổi trả / hoàn tiền (RMA)")
    public ResponseEntity<ApiResponse<OrderDto.RmaResponse>> createRma(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody OrderDto.CreateRmaRequest request) {
        OrderDto.RmaResponse rma = orderService.createRma(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Gửi yêu cầu đổi trả thành công", rma));
    }
}
